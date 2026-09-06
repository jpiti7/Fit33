"use server";

import { listWorkoutsForAnalytics } from "@/features/analytics/repositories/analytics.repository";
import { buildTrainingAnalytics } from "@/features/analytics/services/analytics.service";
import { getTodayDataAction } from "@/features/today/actions/today.actions";
import type { DashboardV9Data } from "@/features/dashboard/types";
import type { RawWorkoutHistoryItem } from "@/features/workouts/history";
import { createClient } from "@/lib/supabase/server";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardV9Action(): Promise<DashboardV9Data> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }

  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [today, rawWorkouts, weightLogs, nutritionLogs] = await Promise.all([
    getTodayDataAction(),
    listWorkoutsForAnalytics(supabase) as Promise<RawWorkoutHistoryItem[]>,
    supabase
      .from("weight_logs")
      .select("weight, waist, body_fat, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(120),
    supabase
      .from("nutrition_logs")
      .select("consumed_on, calories, protein")
      .eq("user_id", user.id)
      .gte("consumed_on", isoDate(fourteenDaysAgo))
      .lte("consumed_on", isoDate(now))
      .order("consumed_on", { ascending: true }),
  ]);

  const analytics = buildTrainingAnalytics(rawWorkouts);
  const normalizedWeights = (weightLogs.data ?? []).map((log) => ({
    date: log.created_at,
    weight: Number(log.weight),
    waist: log.waist === null ? null : Number(log.waist),
    bodyFat: log.body_fat === null ? null : Number(log.body_fat),
  }));

  const nutritionByDay = new Map<
    string,
    { calories: number; protein: number }
  >();
  for (const log of nutritionLogs.data ?? []) {
    const current = nutritionByDay.get(log.consumed_on) ?? {
      calories: 0,
      protein: 0,
    };
    current.calories += Number(log.calories);
    current.protein += Number(log.protein);
    nutritionByDay.set(log.consumed_on, current);
  }

  const nutritionHistory = [...nutritionByDay.entries()].map(
    ([date, values]) => ({
      date,
      ...values,
    }),
  );

  const currentWeight = normalizedWeights.at(-1)?.weight ?? null;
  const oldestWeight = normalizedWeights[0]?.weight ?? null;
  const currentWaist = normalizedWeights.at(-1)?.waist ?? null;
  const oldestWaist =
    normalizedWeights.find((entry) => entry.waist !== null)?.waist ?? null;

  const adherence = Math.min(
    100,
    Math.round(
      (analytics.week.current.sessions /
        Math.max(1, today.preferences.weeklyWorkouts)) *
        100,
    ),
  );

  const muscleGroups = analytics.muscleGroups.slice(0, 5).map((group) => ({
    muscleGroup: group.muscleGroup,
    sessions: group.sessions,
    completedSets: group.completedSets,
    volume: group.volume,
  }));

  return {
    displayName: today.preferences.displayName,
    targetWeight: today.preferences.targetWeight,
    currentWeight,
    weightDelta:
      currentWeight !== null && oldestWeight !== null
        ? currentWeight - oldestWeight
        : null,
    waistDelta:
      currentWaist !== null && oldestWaist !== null
        ? currentWaist - oldestWaist
        : null,
    summary: {
      weeklySessions: analytics.week.current.sessions,
      weeklyVolume: analytics.week.current.volume,
      weeklyDurationMinutes: analytics.week.current.durationMinutes,
      weeklyCompletedSets: analytics.week.current.completedSets,
      averageSessionDurationMinutes:
        analytics.week.current.sessions === 0
          ? 0
          : Math.round(
              analytics.week.current.durationMinutes /
                analytics.week.current.sessions,
            ),
      sessionTrend: {
        value: analytics.week.sessionChangePercent,
        label: "vs semana anterior",
      },
      volumeTrend: {
        value: analytics.week.volumeChangePercent,
        label: "vs semana anterior",
      },
      durationTrend: {
        value: analytics.week.durationChangePercent,
        label: "vs semana anterior",
      },
    },
    muscleFocus: muscleGroups[0] ?? null,
    muscleGroups,
    recentRecords: [...analytics.personalRecords]
      .sort(
        (a, b) =>
          new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime(),
      )
      .slice(0, 5)
      .map((record) => ({
        exerciseName: record.exerciseName,
        muscleGroup: record.muscleGroup,
        maxWeight: record.maxWeight,
        estimatedOneRepMax: record.estimatedOneRepMax,
        achievedAt: record.achievedAt,
      })),
    coachMessages: [
      ...today.coach.recommendations.slice(0, 2).map((message, index) => ({
        id: `coach-${index}`,
        tone: (index === 0 && today.coach.score >= 75
          ? "positive"
          : "neutral") as "positive" | "neutral",
        title: "Coach Fit33",
        message: message.message,
      })),
      ...(analytics.week.current.sessions >= today.preferences.weeklyWorkouts
        ? [
            {
              id: "target",
              tone: "positive" as const,
              title: "Objetivo semanal",
              message:
                "Has alcanzado el objetivo de entrenamientos de esta semana.",
            },
          ]
        : []),
    ].slice(0, 3),
    weightHistory: normalizedWeights.slice(-14),
    nutritionHistory,
    targetCalories: today.preferences.targetCalories,
    targetProtein: today.preferences.targetProtein,
    recoveryScore: today.recovery?.score ?? null,
    weeklyAdherence: adherence,
    nextWorkout: today.plan.sessions[0]
      ? {
          slug: today.plan.sessions[0].slug,
          type: today.plan.sessions[0].type,
          focus: today.plan.sessions[0].focus,
        }
      : null,
  };
}
