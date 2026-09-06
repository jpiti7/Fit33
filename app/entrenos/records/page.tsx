import Link from "next/link";
import { Trophy, Dumbbell, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buildPersonalRecords } from "@/features/workouts/records/records.service";
import { listWorkouts } from "@/features/workouts/repositories/workout.repository";
import { createClient } from "@/lib/supabase/server";

type RawWorkout = {
  exercises?: Array<{
    exercise_name: string;
    muscle_group: string;
    sets?: Array<{ weight: number; reps: number; completed: boolean }>;
  }>;
};

export default async function PersonalRecordsPage() {
  const supabase = await createClient();
  const workouts = (await listWorkouts(supabase, 100)) as RawWorkout[];
  const exercises = workouts.flatMap((workout) =>
    (workout.exercises ?? []).map((exercise) => ({
      exerciseName: exercise.exercise_name,
      muscleGroup: exercise.muscle_group,
      sets: exercise.sets ?? [],
    })),
  );
  const records = buildPersonalRecords(exercises);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/entrenos"
          className="text-sm font-semibold text-slate-400 hover:text-emerald-400"
        >
          ← Volver a entrenamientos
        </Link>

        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Fit33 · v9.1
          </p>
          <h1 className="mt-2 text-3xl font-bold">Récords personales</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Tus mejores cargas, repeticiones y 1RM estimado se calculan a partir
            de las series completadas del historial.
          </p>
        </header>

        {records.length === 0 ? (
          <Card className="mt-8 border-slate-800 bg-slate-900 text-white">
            <CardContent className="py-12 text-center">
              <Trophy className="mx-auto h-10 w-10 text-slate-600" />
              <p className="mt-4 font-semibold">Aún no hay récords</p>
              <p className="mt-2 text-sm text-slate-400">
                Completa alguna sesión para empezar a registrar tus marcas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <Card
                key={record.exerciseName}
                className="border-slate-800 bg-slate-900 text-white"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        {record.muscleGroup}
                      </p>
                      <h2 className="mt-1 font-bold">{record.exerciseName}</h2>
                    </div>
                    <Trophy className="h-5 w-5 shrink-0 text-amber-300" />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-950 p-3">
                      <p className="text-xs text-slate-500">Mejor carga</p>
                      <p className="mt-1 text-xl font-bold">
                        {record.maxWeight.toLocaleString("es-ES")} kg
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-3">
                      <p className="text-xs text-slate-500">Mejor 1RM</p>
                      <p className="mt-1 text-xl font-bold">
                        {record.estimated1RM.toLocaleString("es-ES", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        kg
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    <Dumbbell className="h-4 w-4" />
                    Mejor serie: {record.bestReps} reps
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    Volumen histórico:{" "}
                    {record.totalVolume.toLocaleString("es-ES")} kg
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
