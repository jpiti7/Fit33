import { estimateOneRepMax } from "@/features/workouts/progression/progression.service";

export type RecordSet = {
  weight: number;
  reps: number;
  completed: boolean;
};

export type RecordExercise = {
  exerciseName: string;
  muscleGroup: string;
  sets: RecordSet[];
};

export type PersonalRecord = {
  exerciseName: string;
  muscleGroup: string;
  maxWeight: number;
  bestReps: number;
  estimated1RM: number;
  totalVolume: number;
};

export function buildPersonalRecords(
  exercises: RecordExercise[],
): PersonalRecord[] {
  const grouped = new Map<string, PersonalRecord>();

  for (const exercise of exercises) {
    const completed = exercise.sets.filter((set) => set.completed);
    if (completed.length === 0) continue;

    const current = grouped.get(exercise.exerciseName);
    const candidate = completed.reduce((best, set) => {
      const oneRm = estimateOneRepMax(set.weight, set.reps);
      const bestOneRm = estimateOneRepMax(best.weight, best.reps);
      return oneRm > bestOneRm ? set : best;
    }, completed[0]);

    const maxWeight = Math.max(...completed.map((set) => set.weight));
    const bestReps = Math.max(...completed.map((set) => set.reps));
    const totalVolume = completed.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0,
    );

    grouped.set(exercise.exerciseName, {
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
      maxWeight: Math.max(current?.maxWeight ?? 0, maxWeight),
      bestReps: Math.max(current?.bestReps ?? 0, bestReps),
      estimated1RM: Math.max(
        current?.estimated1RM ?? 0,
        estimateOneRepMax(candidate.weight, candidate.reps),
      ),
      totalVolume: (current?.totalVolume ?? 0) + totalVolume,
    });
  }

  return [...grouped.values()].sort((a, b) => b.estimated1RM - a.estimated1RM);
}
