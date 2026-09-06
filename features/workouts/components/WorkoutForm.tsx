/* eslint-disable react-hooks/incompatible-library */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  CloudOff,
  Dumbbell,
  History,
  Home,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  finishWorkoutAction,
  type FinishWorkoutResult,
} from "@/features/workouts/actions/workout.actions";
import { ExerciseCard } from "@/features/workouts/components/ExerciseCard";
import { SessionHeader } from "@/features/workouts/session/components/SessionHeader";
import { useWorkoutSession } from "@/features/workouts/session/hooks/useWorkoutSession";
import {
  workoutFormSchema,
  type WorkoutFormValues,
} from "@/features/workouts/validations/workout.schema";
import { triggerHaptic } from "@/lib/haptics";
import { enqueueWorkout } from "@/lib/offline/queue";
import type { WorkoutTemplate } from "@/types/workout";

type WorkoutFormProps = {
  template: WorkoutTemplate;
  suggestedWeights?: Record<string, number | null>;
};

type SavedWorkout = Extract<FinishWorkoutResult, { success: true }> & {
  queued?: boolean;
};

function createDefaultValues(
  template: WorkoutTemplate,
  suggestedWeights: Record<string, number | null> = {},
): WorkoutFormValues {
  return {
    workoutType: template.type,
    notes: "",
    exercises: template.exercises.map((exercise, exerciseIndex) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      order: exerciseIndex,
      targetReps: exercise.targetReps,
      sets: Array.from({ length: exercise.targetSets }, () => ({
        weight: suggestedWeights[exercise.name] ?? 0,
        reps: 1,
        rir: 2,
        completed: false,
      })),
    })),
  };
}

export function WorkoutForm({
  template,
  suggestedWeights = {},
}: WorkoutFormProps) {
  const router = useRouter();
  const defaultValues = useMemo(
    () => createDefaultValues(template, suggestedWeights),
    [template, suggestedWeights],
  );
  const [message, setMessage] = useState("");
  const [savedWorkout, setSavedWorkout] = useState<SavedWorkout | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const restoreForm = useCallback(
    (values: WorkoutFormValues) => reset(values),
    [reset],
  );

  const session = useWorkoutSession({
    workoutType: template.type,
    initialValues: defaultValues,
    onRestore: restoreForm,
  });

  const updateLatestValues = session.updateLatestValues;

  useEffect(() => {
    const subscription = watch((values) => {
      updateLatestValues(values as WorkoutFormValues);
    });

    return () => subscription.unsubscribe();
  }, [updateLatestValues, watch]);

  const exercises = watch("exercises");

  const totalSets = exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );

  const completedSets = exercises.reduce(
    (total, exercise) =>
      total + exercise.sets.filter((set) => set.completed).length,
    0,
  );

  const totalVolume = exercises.reduce(
    (exerciseTotal, exercise) =>
      exerciseTotal +
      exercise.sets.reduce((setTotal, set) => {
        if (!set.completed) {
          return setTotal;
        }

        return setTotal + (Number(set.weight) || 0) * (Number(set.reps) || 0);
      }, 0),
    0,
  );

  async function onSubmit(values: WorkoutFormValues) {
    setMessage("");
    session.saveDraft(values);

    const completedExercisesList = values.exercises.filter((exercise) =>
      exercise.sets.some((set) => set.completed),
    );
    const localCompletedSets = completedExercisesList.reduce(
      (total, exercise) =>
        total + exercise.sets.filter((set) => set.completed).length,
      0,
    );

    if (localCompletedSets === 0) {
      setMessage(
        "Marca al menos una serie como completada antes de finalizar.",
      );
      return;
    }

    const localTotalVolume = completedExercisesList.reduce(
      (exerciseTotal, exercise) =>
        exerciseTotal +
        exercise.sets.reduce(
          (setTotal, set) =>
            set.completed ? setTotal + set.weight * set.reps : setTotal,
          0,
        ),
      0,
    );
    const localDurationMinutes = Math.max(
      1,
      Math.round(session.elapsedSeconds / 60),
    );
    const clientId = crypto.randomUUID();

    async function saveOffline() {
      await enqueueWorkout({
        clientId,
        startedAt: session.startedAt,
        values,
      });
      session.completeSession();
      triggerHaptic("success");
      setSavedWorkout({
        success: true,
        queued: true,
        workoutId: clientId,
        totalVolume: localTotalVolume,
        completedSets: localCompletedSets,
        completedExercises: completedExercisesList.length,
        durationMinutes: localDurationMinutes,
      });
    }

    if (!navigator.onLine) {
      try {
        await saveOffline();
      } catch {
        setMessage("No se pudo guardar el entrenamiento en el dispositivo.");
      }
      return;
    }

    try {
      const result = await finishWorkoutAction(
        values,
        session.startedAt,
        clientId,
      );

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      session.completeSession();
      triggerHaptic("success");
      setSavedWorkout(result);
    } catch {
      try {
        await saveOffline();
      } catch {
        setMessage(
          "No se pudo conectar ni guardar el entrenamiento en el dispositivo.",
        );
      }
    }
  }

  function cancelWorkout() {
    const confirmed = window.confirm(
      "¿Seguro que quieres cancelar la sesión? Se perderá el borrador guardado.",
    );

    if (!confirmed) {
      return;
    }

    triggerHaptic("warning");
    session.cancelSession();
    router.push("/entrenos");
  }

  if (savedWorkout) {
    return (
      <Card className="border-emerald-400/30 bg-slate-900 text-white">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
            {savedWorkout.queued ? (
              <CloudOff className="h-9 w-9 text-emerald-400" />
            ) : (
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            )}
          </div>

          <CardTitle className="mt-4 text-3xl">
            {savedWorkout.queued
              ? "Entrenamiento guardado offline"
              : "Entrenamiento guardado"}
          </CardTitle>

          <p className="mt-2 text-sm text-slate-400">
            {savedWorkout.queued
              ? "La sesión está segura en tu iPhone y se sincronizará automáticamente cuando vuelva Internet."
              : `Tu sesión de ${template.type} ya está en el historial.`}
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-950 p-3 sm:p-4">
              <p className="text-xs text-slate-500">Duración</p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {savedWorkout.durationMinutes} min
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 sm:p-4">
              <p className="text-xs text-slate-500">Ejercicios</p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {savedWorkout.completedExercises}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3 sm:p-4">
              <p className="text-xs text-slate-500">Series</p>
              <p className="mt-1 text-lg font-bold sm:text-xl">
                {savedWorkout.completedSets}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Volumen</p>
              <p className="mt-1 text-xl font-bold">
                {savedWorkout.totalVolume.toLocaleString("es-ES")} kg
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/entrenos/historial"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-400 px-4 text-sm font-medium text-slate-950 transition hover:bg-emerald-300"
            >
              <History className="mr-2 h-4 w-4" />
              Ver historial
            </Link>

            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 bg-transparent px-4 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session.isReady) {
    return (
      <Card className="border-slate-800 bg-slate-900 text-white">
        <CardContent className="py-10 text-center text-slate-400">
          Preparando tu sesión...
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="workout-focus space-y-4 pb-28 sm:space-y-6 sm:pb-6"
    >
      <SessionHeader
        elapsedSeconds={session.elapsedSeconds}
        status={session.status}
        remainingRestSeconds={session.remainingRestSeconds}
        restDurationSeconds={session.restDurationSeconds}
        onPause={session.pauseSession}
        onResume={session.resumeSession}
        onStartRest={() => session.startRest()}
        onStopRest={session.stopRest}
        onAddRestSeconds={session.addRestSeconds}
        onCancel={cancelWorkout}
      />

      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70 text-white">
        <CardHeader className="px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                {template.day}
              </p>

              <CardTitle className="mt-1 text-2xl sm:text-3xl">
                {template.type}
              </CardTitle>

              <p className="mt-2 text-sm text-slate-400">
                {template.description}
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-400">
              {session.status === "running"
                ? "Sesión activa"
                : "Sesión pausada"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-5 sm:px-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Ejercicios</p>
              <p className="mt-1 text-xl font-bold">{exercises.length}</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Series completadas</p>
              <p className="mt-1 text-xl font-bold">
                {completedSets} / {totalSets}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Volumen provisional</p>
              <p className="mt-1 text-xl font-bold">
                {totalVolume.toLocaleString("es-ES")} kg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {template.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={`${exercise.name}-${exerciseIndex}`}
            exerciseIndex={exerciseIndex}
            control={control}
            register={register}
            errors={errors}
            name={exercise.name}
            muscleGroup={exercise.muscleGroup}
            targetReps={exercise.targetReps}
            suggestedWeight={suggestedWeights[exercise.name]}
            onSetCompleted={() => session.startRest()}
          />
        ))}
      </div>

      <Card className="border-slate-800 bg-slate-900 text-white">
        <CardContent className="pt-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">
              Observaciones de la sesión
            </span>

            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Sensaciones, molestias, cambios de ejercicios..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
            />
          </label>

          {errors.notes?.message && (
            <p className="mt-2 text-sm text-red-400">{errors.notes.message}</p>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => triggerHaptic("light")}
            className="mt-6 min-h-14 w-full rounded-2xl bg-emerald-400 text-base font-bold text-slate-950 shadow-lg shadow-emerald-950/20 hover:bg-emerald-300 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Dumbbell className="mr-2 h-4 w-4 animate-pulse" />
                Guardando entrenamiento...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Finalizar entrenamiento
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
