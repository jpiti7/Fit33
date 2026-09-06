"use server";

import { revalidatePath } from "next/cache";
import { getCoachReportAction } from "@/features/coach";
import { getNutritionDayAction } from "@/features/nutrition";
import { getLatestRecoveryAction } from "@/features/recovery";
import { getRecoveryState } from "@/features/recovery/services/recovery.service";
import { buildAutonomousSummary } from "@/features/autonomous/services/autonomous.service";
import type { AutonomousActionKind } from "@/features/autonomous/types";
import { buildWeeklyPlan } from "@/features/planner/services/planner.service";
import { getPreferencesAction } from "@/features/settings";
import { createClient } from "@/lib/supabase/server";

export async function getAutonomousSummaryAction() {
  const date = new Date().toISOString().slice(0, 10);
  const [coach, recoveryCheckin, nutrition] = await Promise.all([
    getCoachReportAction(),
    getLatestRecoveryAction(),
    getNutritionDayAction(date),
  ]);
  return buildAutonomousSummary({
    coach,
    recovery: getRecoveryState(recoveryCheckin?.score ?? 65),
    nutrition,
  });
}

export async function applyAutonomousAction(kind: AutonomousActionKind) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user)
      throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo.");

    if (kind === "reorganize_training" || kind === "reduce_training") {
      const [report, preferences, recovery] = await Promise.all([
        getCoachReportAction(),
        getPreferencesAction(),
        getLatestRecoveryAction(),
      ]);
      const score =
        kind === "reduce_training"
          ? Math.min(recovery?.score ?? 65, 45)
          : (recovery?.score ?? 65);
      const plan = buildWeeklyPlan(
        report,
        new Date(),
        preferences.weeklyWorkouts,
        score,
      );
      const { error: saveError } = await supabase.from("workout_plans").upsert(
        {
          user_id: user.id,
          week_start: plan.weekStart,
          plan: plan.sessions,
          generated_by: "rules",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,week_start" },
      );
      if (saveError)
        throw new Error(
          `No se pudo guardar el nuevo plan: ${saveError.message}`,
        );
      revalidatePath("/planificacion");
      revalidatePath("/");
      return {
        success: true as const,
        message:
          kind === "reduce_training"
            ? "Sesión protegida y plan actualizado."
            : "Semana reorganizada y guardada.",
      };
    }

    return {
      success: true as const,
      message:
        kind === "nutrition_review"
          ? "Abre Nutrición para revisar el día."
          : "Abre Recuperación para completar el check-in.",
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo aplicar la propuesta.",
    };
  }
}

export async function acknowledgeAutonomousAction(kind: AutonomousActionKind) {
  return applyAutonomousAction(kind);
}
