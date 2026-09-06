import Link from "next/link";
import { getPreferencesAction } from "@/features/settings/actions/settings.actions";
import { ProfileEditor } from "@/features/settings/components/ProfileEditor";

export default async function EditProfilePage() {
  const preferences = await getPreferencesAction();
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/perfil"
          className="text-sm font-semibold text-slate-400 hover:text-emerald-400"
        >
          ← Volver al perfil
        </Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Fit33
          </p>
          <h1 className="mt-2 text-3xl font-bold">Editar perfil</h1>
          <p className="mt-2 text-slate-400">
            Actualiza tus objetivos y preferencias. Los cambios se guardan en tu
            cuenta.
          </p>
        </header>
        <ProfileEditor preferences={preferences} />
      </div>
    </main>
  );
}
