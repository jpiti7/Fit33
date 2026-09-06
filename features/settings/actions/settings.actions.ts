"use server";

import { revalidatePath } from "next/cache";

import {
  addHydration,
  getHydrationDay,
  getOrCreateNotificationPreferences,
  getOrCreatePreferences,
} from "@/features/settings/services/settings.service";
import {
  upsertNotificationPreferences,
  upsertPreferences,
} from "@/features/settings/repositories/settings.repository";
import type { NotificationPreferences } from "@/features/settings/types";
import { createClient } from "@/lib/supabase/server";

async function authenticated() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Tu sesión ha caducado.");
  return { supabase, user };
}

export async function getPreferencesAction() {
  const { supabase, user } = await authenticated();
  return getOrCreatePreferences(supabase, user.id);
}

export async function getHydrationDayAction(date: string) {
  const { supabase, user } = await authenticated();
  const preferences = await getOrCreatePreferences(supabase, user.id);
  return getHydrationDay(supabase, date, preferences.targetWaterMl);
}

export async function addHydrationAction(date: string, amountMl: number) {
  try {
    const { supabase, user } = await authenticated();
    await addHydration(supabase, user.id, date, amountMl);
    revalidatePath("/");
    revalidatePath("/nutricion");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo registrar el agua.",
    };
  }
}

export async function getNotificationPreferencesAction() {
  const { supabase, user } = await authenticated();
  return getOrCreateNotificationPreferences(supabase, user.id);
}

export async function saveNotificationPreferencesAction(
  preferences: NotificationPreferences,
) {
  try {
    const { supabase, user } = await authenticated();
    await upsertNotificationPreferences(supabase, user.id, preferences);
    revalidatePath("/perfil/notificaciones");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los avisos.",
    };
  }
}

export async function saveProfileAction(formData: FormData) {
  try {
    const { supabase, user } = await authenticated();
    const current = await getOrCreatePreferences(supabase, user.id);
    const parseNumber = (name: string, fallback: number) => {
      const value = Number(formData.get(name));
      return Number.isFinite(value) ? value : fallback;
    };
    const parseList = (name: string, fallback: string[]) => {
      const raw = String(formData.get(name) ?? "");
      const values = raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return values.length ? Array.from(new Set(values)) : fallback;
    };
    const displayName = String(formData.get("displayName") ?? "").trim();
    if (displayName.length < 2 || displayName.length > 60) {
      return {
        success: false as const,
        message: "El nombre debe tener entre 2 y 60 caracteres.",
      };
    }
    const targetWeightRaw = String(formData.get("targetWeight") ?? "").trim();
    const targetWeight =
      targetWeightRaw === "" ? null : Number(targetWeightRaw);
    if (
      targetWeight !== null &&
      (!Number.isFinite(targetWeight) ||
        targetWeight < 30 ||
        targetWeight > 300)
    ) {
      return {
        success: false as const,
        message: "El peso objetivo debe estar entre 30 y 300 kg.",
      };
    }
    const updated = {
      ...current,
      displayName,
      targetWeight,
      targetCalories: parseNumber("targetCalories", current.targetCalories),
      targetProtein: parseNumber("targetProtein", current.targetProtein),
      targetCarbs: parseNumber("targetCarbs", current.targetCarbs),
      targetFat: parseNumber("targetFat", current.targetFat),
      targetWaterMl: parseNumber("targetWaterMl", current.targetWaterMl),
      weeklyWorkouts: parseNumber("weeklyWorkouts", current.weeklyWorkouts),
      preferredTrainingTime:
        String(formData.get("preferredTrainingTime") ?? "").trim() || null,
      allergies: parseList("allergies", current.allergies),
      dislikedFoods: parseList("dislikedFoods", current.dislikedFoods),
    };
    if (
      updated.targetCalories < 1000 ||
      updated.targetCalories > 6000 ||
      updated.targetProtein < 40 ||
      updated.targetProtein > 400 ||
      updated.targetCarbs < 40 ||
      updated.targetCarbs > 800 ||
      updated.targetFat < 20 ||
      updated.targetFat > 250 ||
      updated.targetWaterMl < 500 ||
      updated.targetWaterMl > 10000 ||
      updated.weeklyWorkouts < 1 ||
      updated.weeklyWorkouts > 7
    ) {
      return {
        success: false as const,
        message:
          "Revisa los objetivos: hay algún valor fuera de los límites permitidos.",
      };
    }
    await upsertPreferences(supabase, updated);
    revalidatePath("/perfil");
    revalidatePath("/perfil/editar");
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.",
    };
  }
}
