import { describe, expect, it } from "vitest";
import {
  EXERCISE_LIBRARY,
  EXERCISE_MUSCLE_GROUPS,
} from "@/features/exercise-library/data";

describe("Exercise Library", () => {
  it("contiene variantes para varios grupos musculares", () => {
    expect(EXERCISE_MUSCLE_GROUPS.length).toBeGreaterThanOrEqual(10);
    expect(EXERCISE_LIBRARY.length).toBeGreaterThanOrEqual(100);
  });

  it("mantiene ejercicios identificados por grupo muscular y equipamiento", () => {
    expect(
      EXERCISE_LIBRARY.every(
        (exercise) =>
          exercise.name && exercise.muscleGroup && exercise.equipment,
      ),
    ).toBe(true);
  });
});
