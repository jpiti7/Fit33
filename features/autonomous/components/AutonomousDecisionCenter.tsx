"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";
import type { AutonomousSummary } from "@/features/autonomous/types";
import { buildDecisionPreviews } from "@/features/autonomous/services/decision.service";
import { applyAutonomousAction } from "@/features/autonomous/actions";

export function AutonomousDecisionCenter({
  data,
}: {
  data: AutonomousSummary;
}) {
  const previews = useMemo(() => buildDecisionPreviews(data), [data]);
  const [selected, setSelected] = useState(0);
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const preview = previews[selected];

  if (!preview) {
    return null;
  }

  async function confirm() {
    setPending(true);
    setMessage("");
    const result = await applyAutonomousAction(preview.action);
    setPending(false);
    if (!result.success) {
      setMessage(result.message);
      return;
    }
    setConfirmed((current) =>
      current.includes(preview.action) ? current : [...current, preview.action],
    );
    setMessage(result.message);
  }

  const done = confirmed.includes(preview.action);

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
          <ClipboardCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Centro de decisiones
          </p>
          <h2 className="mt-1 text-2xl font-black">
            Detectar → proponer → confirmar
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Revisa primero el impacto. Fit33 no cambia tu planificación ni tu
            nutrición sin una confirmación explícita.
          </p>
        </div>
      </div>

      {previews.length > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {previews.map((item, index) => (
            <button
              key={item.action}
              type="button"
              onClick={() => setSelected(index)}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${
                selected === index
                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                  : "border-slate-700 text-slate-400"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          Vista previa
        </p>
        <h3 className="mt-2 text-xl font-bold">{preview.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {preview.impact}
        </p>
        <ol className="mt-4 space-y-3">
          {preview.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-slate-400">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-cyan-200">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={done || pending}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cyan-300 px-4 font-bold text-slate-950 disabled:opacity-70"
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {done ? "Confirmado" : "Confirmar propuesta"}
          </button>
          {message && (
            <p aria-live="polite" className="basis-full text-sm text-slate-400">
              {message}
            </p>
          )}
          <Link
            href={
              preview.action === "reorganize_training"
                ? "/planificacion"
                : preview.action === "reduce_training"
                  ? "/adaptativo"
                  : preview.action === "nutrition_review"
                    ? "/nutricion"
                    : "/recuperacion"
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-700 px-4 font-semibold text-slate-200"
          >
            <RotateCcw className="h-4 w-4" />
            Abrir módulo
          </Link>
        </div>
      </div>
    </section>
  );
}
