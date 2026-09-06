import Link from "next/link";
const trainingDays = [
  {
    day: "Lunes",
    name: "Push",
    slug: "push",
    muscles: "Pecho, hombro y tríceps",
    exercises: 7,
  },
  {
    day: "Martes",
    name: "Pierna A",
    slug: "pierna-a",
    muscles: "Cuádriceps, femoral y gemelos",
    exercises: 6,
  },
  {
    day: "Jueves",
    name: "Pull",
    slug: "pull",
    muscles: "Espalda y bíceps",
    exercises: 7,
  },
  {
    day: "Viernes",
    name: "Pierna B + hombro",
    slug: "pierna-b-hombro",
    muscles: "Glúteo, femoral y deltoides",
    exercises: 7,
  },
];

export default function TrainingsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Fit33
          </p>

          <h1 className="mt-2 text-3xl font-bold">Entrenamientos</h1>

          <p className="mt-2 text-slate-400">
            Tu rutina semanal de cuatro días.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/entrenos/historial"
            className="rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
          >
            Ver historial
          </Link>
          <Link
            href="/biblioteca-ejercicios"
            className="rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-300 transition hover:border-emerald-400 hover:text-emerald-400"
          >
            Biblioteca de ejercicios
          </Link>
          <Link
            href="/analiticas"
            className="rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-5 py-3 text-center font-semibold text-emerald-400 transition hover:bg-emerald-400 hover:text-slate-950"
          >
            Abrir analítica
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          {trainingDays.map((training) => (
            <article
              key={training.day}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {training.day}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">{training.name}</h2>
                </div>

                <span className="rounded-full bg-slate-950 px-3 py-1 text-sm text-slate-400">
                  {training.exercises} ejercicios
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-400">{training.muscles}</p>

              <Link
                href={`/entrenos/${training.slug}`}
                className="mt-6 block w-full rounded-xl bg-emerald-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Comenzar entrenamiento
              </Link>
            </article>
          ))}
        </section>
      </div>
      <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/entrenos/records"
          className="inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-emerald-400 hover:text-emerald-400"
        >
          🏆 Ver récords personales
        </Link>
      </div>
    </main>
  );
}
