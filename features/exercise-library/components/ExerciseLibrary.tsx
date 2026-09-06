"use client";

import { useMemo, useState } from "react";
import { Search, Dumbbell } from "lucide-react";
import {
  EXERCISE_LIBRARY,
  EXERCISE_MUSCLE_GROUPS,
} from "@/features/exercise-library/data";

export function ExerciseLibrary() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Todos");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((exercise) => {
      const matchesMuscle =
        muscle === "Todos" || exercise.muscleGroup === muscle;
      const matchesQuery =
        !normalized ||
        `${exercise.name} ${exercise.muscleGroup} ${exercise.equipment}`
          .toLowerCase()
          .includes(normalized);
      return matchesMuscle && matchesQuery;
    });
  }, [muscle, query]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
          <Search className="h-5 w-5 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ejercicio..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["Todos", ...EXERCISE_MUSCLE_GROUPS].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMuscle(item)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${muscle === item ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-slate-700 text-slate-400"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} ejercicios disponibles
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => (
          <article
            key={`${exercise.muscleGroup}-${exercise.name}`}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Dumbbell className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-bold text-white">{exercise.name}</h2>
                <p className="mt-1 text-xs text-emerald-300">
                  {exercise.muscleGroup}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {exercise.equipment} · {exercise.movement}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
