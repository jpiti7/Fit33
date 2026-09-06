"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Scale,
  Target,
  Trophy,
  Utensils,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardV9Data } from "@/features/dashboard/types";

function number(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

export function DashboardV9({ data }: { data: DashboardV9Data }) {
  const weightChart = data.weightHistory.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(point.date)),
  }));
  const nutritionChart = data.nutritionHistory.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(`${point.date}T12:00:00`)),
  }));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 via-slate-900 to-slate-900 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                FIT33 V9 · DASHBOARD
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Hola, {data.displayName}
              </h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                Tu centro de control: progreso físico, fuerza, entrenamiento,
                nutrición y recuperación.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/entrenos"
                className="rounded-2xl bg-emerald-400 px-5 py-3 font-bold text-slate-950"
              >
                Entrenar
              </Link>
              <Link
                href="/nutricion/planificador"
                className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold"
              >
                Planificar comida
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Scale />}
            label="Peso actual"
            value={
              data.currentWeight === null
                ? "—"
                : `${data.currentWeight.toLocaleString("es-ES")} kg`
            }
            extra={
              data.targetWeight === null
                ? "Sin objetivo"
                : `Objetivo ${data.targetWeight.toLocaleString("es-ES")} kg`
            }
          />
          <Metric
            icon={<Dumbbell />}
            label="Entrenos esta semana"
            value={`${data.summary.weeklySessions} sesiones`}
            extra={`Adherencia ${data.weeklyAdherence}% · ${number(data.summary.weeklyVolume)} kg de volumen`}
          />
          <Metric
            icon={<HeartPulse />}
            label="Recuperación"
            value={
              data.recoveryScore === null ? "—" : `${data.recoveryScore}/100`
            }
            extra={
              data.recoveryScore === null
                ? "Haz tu check-in"
                : data.recoveryScore >= 75
                  ? "Lista para progresar"
                  : "Ajusta la carga"
            }
          />
          <Metric
            icon={<Target />}
            label="Adherencia"
            value={`${data.weeklyAdherence}%`}
            extra={`${data.summary.weeklyCompletedSets} series completadas`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Evolución corporal</p>
                <h2 className="mt-1 text-xl font-bold">
                  Peso últimos registros
                </h2>
              </div>
              <Scale className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="mt-5 h-64">
              {weightChart.length < 2 ? (
                <Empty text="Registra al menos dos pesos para ver la tendencia." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      domain={["dataMin - 1", "dataMax + 1"]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: 16,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#34d399"
                      fill="#34d399"
                      fillOpacity={0.15}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Delta label="Peso" value={data.weightDelta} unit="kg" />
              <Delta label="Cintura" value={data.waistDelta} unit="cm" />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Entrenamiento</p>
                <h2 className="mt-1 text-xl font-bold">Esta semana</h2>
              </div>
              <Activity className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="mt-6 space-y-5">
              <ProgressRow
                label="Sesiones"
                value={data.summary.weeklySessions}
                target={4}
                suffix=""
              />
              <ProgressRow
                label="Series"
                value={data.summary.weeklyCompletedSets}
                target={40}
                suffix=""
              />
              <ProgressRow
                label="Volumen"
                value={data.summary.weeklyVolume}
                target={10000}
                suffix=" kg"
              />
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Duración media
                </p>
                <p className="mt-1 text-2xl font-black">
                  {data.summary.averageSessionDurationMinutes} min
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Nutrición</p>
                <h2 className="mt-1 text-xl font-bold">
                  Últimos días registrados
                </h2>
              </div>
              <Utensils className="h-6 w-6 text-lime-300" />
            </div>
            <div className="mt-5 h-64">
              {nutritionChart.length === 0 ? (
                <Empty text="Registra comidas para empezar a ver tu adherencia nutricional." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nutritionChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: 16,
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      fill="#a3e635"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Objetivo diario</p>
                <p className="mt-1 text-xl font-black">
                  {number(data.targetCalories)} kcal
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4">
                <p className="text-xs text-slate-500">Proteína diaria</p>
                <p className="mt-1 text-xl font-black">
                  {number(data.targetProtein)} g
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">
                  Distribución de trabajo
                </p>
                <h2 className="mt-1 text-xl font-bold">Músculos</h2>
              </div>
              <Dumbbell className="h-6 w-6 text-violet-300" />
            </div>
            <div className="mt-5 space-y-3">
              {data.muscleGroups.length === 0 ? (
                <Empty text="Completa entrenamientos para analizar grupos musculares." />
              ) : (
                data.muscleGroups.map((group) => (
                  <div key={group.muscleGroup}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{group.muscleGroup}</span>
                      <span className="text-slate-500">
                        {number(group.volume)} kg
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-violet-400"
                        style={{
                          width: `${Math.min(100, (group.volume / Math.max(1, data.muscleGroups[0].volume)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Récords recientes</p>
                <h2 className="mt-1 text-xl font-bold">
                  Tus mejores referencias
                </h2>
              </div>
              <Trophy className="h-6 w-6 text-amber-300" />
            </div>
            <div className="mt-5 space-y-3">
              {data.recentRecords.length === 0 ? (
                <Empty text="Aún no hay récords registrados." />
              ) : (
                data.recentRecords.map((record) => (
                  <div
                    key={`${record.exerciseName}-${record.achievedAt}`}
                    className="flex items-center justify-between rounded-2xl bg-slate-950 p-4"
                  >
                    <div>
                      <p className="font-bold">{record.exerciseName}</p>
                      <p className="text-xs text-slate-500">
                        {record.muscleGroup ?? "Sin grupo"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">
                        {record.maxWeight.toLocaleString("es-ES")} kg
                      </p>
                      <p className="text-xs text-emerald-300">
                        1RM est.{" "}
                        {record.estimatedOneRepMax.toLocaleString("es-ES", {
                          maximumFractionDigits: 1,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-orange-300" />
              <h2 className="text-xl font-bold">Coach Fit33</h2>
            </div>
            <div className="mt-5 space-y-3">
              {data.coachMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl bg-slate-950/70 p-4"
                >
                  <p className="font-bold">{message.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
            {data.nextWorkout && (
              <Link
                href={`/entrenos/${data.nextWorkout.slug}`}
                className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-emerald-400 font-bold text-slate-950"
              >
                <CalendarDays className="mr-2 h-5 w-5" /> Próximo:{" "}
                {data.nextWorkout.type}
              </Link>
            )}
          </article>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/progreso"
            icon={<Scale />}
            title="Progreso"
            text="Peso, cintura y composición"
          />
          <QuickLink
            href="/adaptativo"
            icon={<Activity />}
            title="Entreno adaptativo"
            text="Carga recomendada por ejercicio"
          />
          <QuickLink
            href="/nutricion/planificador"
            icon={<Utensils />}
            title="Menú semanal"
            text="Más variedad y lista de compra"
          />
          <QuickLink
            href="/retos"
            icon={<Trophy />}
            title="Retos"
            text="Rachas y objetivos"
          />
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  extra,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  extra: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">{label}</span>
        <span className="text-emerald-300">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{extra}</p>
    </article>
  );
}
function Delta({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  if (value === null)
    return (
      <span className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-400">
        {label}: —
      </span>
    );
  const down = value < 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm ${down ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
    >
      {down ? (
        <ArrowDownRight className="mr-1 h-4 w-4" />
      ) : (
        <ArrowUpRight className="mr-1 h-4 w-4" />
      )}
      {label}: {value > 0 ? "+" : ""}
      {value.toLocaleString("es-ES", { maximumFractionDigits: 1 })} {unit}
    </span>
  );
}
function ProgressRow({
  label,
  value,
  target,
  suffix,
}: {
  label: string;
  value: number;
  target: number;
  suffix: string;
}) {
  const percent = Math.min(
    100,
    Math.round((value / Math.max(1, target)) * 100),
  );
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">
          {number(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-emerald-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
function QuickLink({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-400/40"
    >
      <span className="text-emerald-300">{icon}</span>
      <p className="mt-4 font-bold">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </Link>
  );
}
