import Link from "next/link";
import { ExerciseLibrary } from "@/features/exercise-library/components/ExerciseLibrary";

export default function ExerciseLibraryPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 pb-28 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/entrenos"
          className="text-sm font-semibold text-slate-400 hover:text-emerald-400"
        >
          ← Volver a entrenamientos
        </Link>
        <header className="mt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Fit33
          </p>
          <h1 className="mt-2 text-3xl font-bold">Biblioteca de ejercicios</h1>
          <p className="mt-2 max-w-2xl text-slate-400">
            Más variantes por grupo muscular para que el Adaptive Engine pueda
            ampliar la rotación sin perder el objetivo de cada sesión.
          </p>
        </header>
        <section className="mt-8">
          <ExerciseLibrary />
        </section>
      </div>
    </main>
  );
}
