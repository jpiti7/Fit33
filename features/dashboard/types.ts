export type DashboardTrend = {
  value: number | null;
  label: string;
};

export type DashboardSummary = {
  weeklySessions: number;
  weeklyVolume: number;
  weeklyDurationMinutes: number;
  weeklyCompletedSets: number;
  averageSessionDurationMinutes: number;
  sessionTrend: DashboardTrend;
  volumeTrend: DashboardTrend;
  durationTrend: DashboardTrend;
};

export type DashboardMuscleFocus = {
  muscleGroup: string;
  sessions: number;
  completedSets: number;
  volume: number;
} | null;

export type DashboardRecord = {
  exerciseName: string;
  muscleGroup: string | null;
  maxWeight: number;
  estimatedOneRepMax: number;
  achievedAt: string;
};

export type DashboardCoachMessage = {
  id: string;
  tone: "positive" | "warning" | "neutral";
  title: string;
  message: string;
};

export type DashboardWeightPoint = {
  date: string;
  weight: number;
  waist: number | null;
  bodyFat: number | null;
};

export type DashboardNutritionPoint = {
  date: string;
  calories: number;
  protein: number;
};

export type DashboardTrainingData = {
  summary: DashboardSummary;
  muscleFocus: DashboardMuscleFocus;
  recentRecords: DashboardRecord[];
  coachMessages: DashboardCoachMessage[];
};

export type DashboardV9Data = {
  displayName: string;
  targetWeight: number | null;
  currentWeight: number | null;
  weightDelta: number | null;
  waistDelta: number | null;
  summary: DashboardSummary;
  muscleFocus: DashboardMuscleFocus;
  muscleGroups: Array<{
    muscleGroup: string;
    sessions: number;
    completedSets: number;
    volume: number;
  }>;
  recentRecords: DashboardRecord[];
  coachMessages: DashboardCoachMessage[];
  weightHistory: DashboardWeightPoint[];
  nutritionHistory: DashboardNutritionPoint[];
  targetCalories: number;
  targetProtein: number;
  recoveryScore: number | null;
  weeklyAdherence: number;
  nextWorkout: { slug: string; type: string; focus: string } | null;
};
