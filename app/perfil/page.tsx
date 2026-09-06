import Link from "next/link";

import { logout } from "@/app/login/actions";
import { getPreferencesAction } from "@/features/settings/actions/settings.actions";

export default async function ProfilePage() {
  const preferences = await getPreferencesAction();
  const profileData = [
    { label: "Nombre", value: preferences.displayName },
    { label: "Edad", value: "28 años" },
    { label: "Altura", value: "170 cm" },
    {
      label: "Peso objetivo",
      value: preferences.targetWeight
        ? `${preferences.targetWeight} kg`
        : "Sin definir",
    },
    { label: "Calorías", value: `${preferences.targetCalories} kcal` },
    { label: "Proteína", value: `${preferences.targetProtein} g` },
    {
      label: "Entrenamientos",
      value: `${preferences.weeklyWorkouts} días por semana`,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Fit33
          </p>

          <h1 className="mt-2 text-3xl font-bold">Perfil</h1>

          <p className="mt-2 text-slate-400">
            Información personal y configuración del plan.
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {profileData.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${
                index !== profileData.length - 1
                  ? "border-b border-slate-800"
                  : ""
              }`}
            >
              <span className="text-sm text-slate-400">{item.label}</span>

              <span className="text-right font-semibold">{item.value}</span>
            </div>
          ))}
        </section>

        <Link
          href="/perfil/editar"
          className="mt-6 block w-full rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
        >
          Editar perfil
        </Link>

        <Link
          href="/recuperacion"
          className="mt-4 block w-full rounded-xl border border-emerald-400/40 bg-emerald-400/5 px-5 py-3 text-center font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
        >
          Registrar recuperación diaria
        </Link>

        <Link
          href="/perfil/notificaciones"
          className="mt-4 block w-full rounded-xl border border-violet-400/40 bg-violet-400/5 px-5 py-3 text-center font-semibold text-violet-300 transition hover:bg-violet-400/10"
        >
          Configurar notificaciones
        </Link>

        <Link
          href="/instalar"
          className="mt-4 block w-full rounded-xl border border-emerald-400/40 bg-emerald-400/5 px-5 py-3 text-center font-semibold text-emerald-300 transition hover:bg-emerald-400/10"
        >
          Instalar Fit33 en iPhone
        </Link>

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-xl border border-red-500/40 bg-red-500/5 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/10"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
