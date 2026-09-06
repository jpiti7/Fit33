export type ProgressionDecision = "subir" | "mantener" | "bajar";

export type ProgressionInput = {
  targetReps: string;
  completedSets: Array<{ weight: number; reps: number; rir: number }>;
};

export type ProgressionResult = {
  decision: ProgressionDecision;
  suggestedWeight: number | null;
  reason: string;
};

function parseRepRange(targetReps: string) {
  const numbers = targetReps.match(/\d+/g)?.map(Number) ?? [];
  const min = numbers[0] ?? 1;
  const max = numbers[1] ?? min;
  return { min, max };
}

function roundLoad(value: number) {
  return Math.max(0, Math.round(value * 2) / 2);
}

export function calculateProgression({
  targetReps,
  completedSets,
}: ProgressionInput): ProgressionResult {
  if (completedSets.length === 0) {
    return {
      decision: "mantener",
      suggestedWeight: null,
      reason: "Completa al menos una serie para generar una progresión.",
    };
  }

  const { min, max } = parseRepRange(targetReps);
  const averageRir =
    completedSets.reduce((sum, set) => sum + set.rir, 0) / completedSets.length;
  const bestWeight = Math.max(...completedSets.map((set) => set.weight));
  const allReachedTop = completedSets.every((set) => set.reps >= max);
  const anyBelowMinimum = completedSets.some((set) => set.reps < min);

  if (allReachedTop && averageRir >= 2 && bestWeight > 0) {
    return {
      decision: "subir",
      suggestedWeight: roundLoad(bestWeight * 1.025),
      reason: `Has completado el rango alto con RIR medio ${averageRir.toFixed(1)}. Sube aproximadamente un 2,5%.`,
    };
  }

  if (anyBelowMinimum && averageRir <= 1 && bestWeight > 0) {
    return {
      decision: "bajar",
      suggestedWeight: roundLoad(bestWeight * 0.95),
      reason: `Te has quedado por debajo del rango con RIR medio ${averageRir.toFixed(1)}. Reduce aproximadamente un 5%.`,
    };
  }

  return {
    decision: "mantener",
    suggestedWeight: bestWeight > 0 ? roundLoad(bestWeight) : null,
    reason: `Mantén la carga y busca consolidar ${min}-${max} repeticiones con técnica sólida.`,
  };
}

export function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}
