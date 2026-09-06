"use server";

import { getCoachReportAction } from "@/features/coach";
import { buildWeeklyPlan } from "@/features/planner/services/planner.service";
import { getLatestRecoveryAction } from "@/features/recovery";
import { getPreferencesAction } from "@/features/settings";
import { createClient } from "@/lib/supabase/server";

export async function getWeeklyPlanAction() {
  const [report, preferences, recovery] = await Promise.all([
    getCoachReportAction(),
    getPreferencesAction(),
    getLatestRecoveryAction(),
  ]);

  const plan = buildWeeklyPlan(
    report,
    new Date(),
    preferences.weeklyWorkouts,
    recovery?.score ?? 65,
  );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("workout_plans").upsert(
      {
        user_id: user.id,
        week_start: plan.weekStart,
        plan: plan.sessions,
        generated_by: "rules",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_start" },
    );
  }

  return plan;
}
