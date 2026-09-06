"use client";

import { Plus } from "lucide-react";
import {
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SetRow } from "@/features/workouts/components/SetRow";
import type { WorkoutFormValues } from "@/features/workouts/validations/workout.schema";

type ExerciseCardProps = {
  exerciseIndex: number;
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  errors: FieldErrors<WorkoutFormValues>;
  name: string;
  muscleGroup: string;
  targetReps: string;
  suggestedWeight?: number | null;
  onSetCompleted?: () => void;
};

export function ExerciseCard({
  exerciseIndex,
  control,
  register,
  errors,
  name,
  muscleGroup,
  targetReps,
  suggestedWeight,
  onSetCompleted,
}: ExerciseCardProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  function addSet() {
    append({
      weight: 0,
      reps: 0,
      rir: 2,
      completed: false,
    });
  }

  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-900 text-white shadow-lg shadow-black/10">
      <CardHeader className="px-4 pb-4 pt-5 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{name}</CardTitle>

            <CardDescription className="mt-1">
              {muscleGroup} · objetivo {targetReps} repeticiones
            </CardDescription>
            {suggestedWeight != null && suggestedWeight > 0 && (
              <p className="mt-2 text-xs font-semibold text-emerald-300">
                Carga sugerida: {suggestedWeight.toLocaleString("es-ES")} kg
              </p>
            )}
          </div>

          <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            {fields.length} series
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-5 sm:px-6">
        <div className="mb-2 grid grid-cols-[36px_1fr_1fr_1fr_48px_40px] sm:grid-cols-[40px_1fr_1fr_1fr_42px_40px] gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Serie</span>
          <span>Kg</span>
          <span>Reps</span>
          <span>RIR</span>
          <span>Hecha</span>
          <span />
        </div>

        <div className="space-y-3">
          {fields.map((field, setIndex) => (
            <SetRow
              key={field.id}
              exerciseIndex={exerciseIndex}
              setIndex={setIndex}
              control={control}
              register={register}
              errors={errors}
              canDelete={fields.length > 1}
              onDelete={() => remove(setIndex)}
              onCompleted={onSetCompleted}
            />
          ))}
        </div>

        {errors.exercises?.[exerciseIndex]?.sets?.message && (
          <p className="mt-3 text-sm text-red-400">
            {errors.exercises[exerciseIndex]?.sets?.message}
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addSet}
          className="mt-5 w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Añadir serie
        </Button>
      </CardContent>
    </Card>
  );
}
