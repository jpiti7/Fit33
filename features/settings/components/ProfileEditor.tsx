"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { saveProfileAction } from "@/features/settings/actions/settings.actions";
import type { UserPreferences } from "@/features/settings/types";

type Props = { preferences: UserPreferences };

export function ProfileEditor({ preferences }: Props) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const result = await saveProfileAction(formData);
    setPending(false);
    setMessage(
      result.success ? "Perfil actualizado correctamente." : result.message,
    );
  }

  return (
    <form
      action={submit}
      className="mt-8 space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre"
          name="displayName"
          defaultValue={preferences.displayName}
          required
        />
        <Field
          label="Peso objetivo (kg)"
          name="targetWeight"
          type="number"
          step="0.1"
          defaultValue={preferences.targetWeight ?? ""}
        />
        <Field
          label="Calorías objetivo"
          name="targetCalories"
          type="number"
          defaultValue={preferences.targetCalories}
          required
        />
        <Field
          label="Proteína (g)"
          name="targetProtein"
          type="number"
          defaultValue={preferences.targetProtein}
          required
        />
        <Field
          label="Carbohidratos (g)"
          name="targetCarbs"
          type="number"
          defaultValue={preferences.targetCarbs}
          required
        />
        <Field
          label="Grasas (g)"
          name="targetFat"
          type="number"
          defaultValue={preferences.targetFat}
          required
        />
        <Field
          label="Agua (ml)"
          name="targetWaterMl"
          type="number"
          defaultValue={preferences.targetWaterMl}
          required
        />
        <Field
          label="Entrenamientos por semana"
          name="weeklyWorkouts"
          type="number"
          min="1"
          max="7"
          defaultValue={preferences.weeklyWorkouts}
          required
        />
        <Field
          label="Hora preferida de entrenamiento"
          name="preferredTrainingTime"
          type="time"
          defaultValue={preferences.preferredTrainingTime ?? ""}
        />
      </div>
      <TextArea
        label="Alergias (separadas por comas)"
        name="allergies"
        defaultValue={preferences.allergies.join(", ")}
      />
      <TextArea
        label="Alimentos que no te gustan (separados por comas)"
        name="dislikedFoods"
        defaultValue={preferences.dislikedFoods.join(", ")}
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={pending}
          type="submit"
          className="min-h-12 rounded-2xl bg-emerald-400 px-5 font-bold text-slate-950 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        {message && (
          <p aria-live="polite" className="text-sm text-slate-300">
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      <span>{label}</span>
      <input
        name={name}
        className="mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-white outline-none focus:border-emerald-400"
        {...props}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-300">
      <span>{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}
