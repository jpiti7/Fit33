export type ExerciseLibraryItem = {
  name: string;
  muscleGroup: string;
  equipment: string;
  movement:
    "empuje" | "tiron" | "bisagra" | "sentadilla" | "aislamiento" | "core";
};
