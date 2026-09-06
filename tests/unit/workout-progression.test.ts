import { describe, expect, it } from "vitest";

import {
  calculateProgression,
  estimateOneRepMax,
} from "@/features/workouts/progression/progression.service";

const base = { targetReps: "8-10" };

describe("workout progression", () => {
  it("sube la carga cuando se alcanza el rango alto con margen", () => {
    const result = calculateProgression({
      ...base,
      completedSets: [
        { weight: 80, reps: 10, rir: 2 },
        { weight: 80, reps: 10, rir: 2 },
        { weight: 80, reps: 10, rir: 3 },
      ],
    });

    expect(result.decision).toBe("subir");
    expect(result.suggestedWeight).toBe(82);
  });

  it("baja la carga cuando no se llega al mínimo y el RIR es bajo", () => {
    const result = calculateProgression({
      ...base,
      completedSets: [
        { weight: 80, reps: 6, rir: 1 },
        { weight: 80, reps: 7, rir: 1 },
      ],
    });

    expect(result.decision).toBe("bajar");
    expect(result.suggestedWeight).toBe(76);
  });

  it("mantiene la carga en una zona intermedia", () => {
    const result = calculateProgression({
      ...base,
      completedSets: [
        { weight: 80, reps: 9, rir: 2 },
        { weight: 80, reps: 8, rir: 2 },
      ],
    });

    expect(result.decision).toBe("mantener");
    expect(result.suggestedWeight).toBe(80);
  });

  it("calcula el 1RM estimado con Epley", () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(116.67, 2);
  });
});
