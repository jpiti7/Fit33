import type { UserPreferences } from "@/features/settings/types";
import {
  RECIPE_CATALOG,
  type RecipeTemplate,
} from "@/features/nutrition-planner/services/recipe-catalog";
import type {
  GenerateMealPlanInput,
  Ingredient,
  MealPlanDay,
  PlannedMeal,
  ShoppingListItem,
} from "@/features/nutrition-planner/types";

const DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function recipeIsAllowed(recipe: RecipeTemplate, preferences: UserPreferences) {
  const excluded = [...preferences.allergies, ...preferences.dislikedFoods]
    .map(normalize)
    .filter(Boolean);

  if (excluded.length === 0) return true;

  const searchable = normalize(
    [
      recipe.name,
      recipe.description,
      ...recipe.ingredients.map((ingredient) => ingredient.name),
      ...recipe.tags,
    ].join(" "),
  );

  return !excluded.some((item) => searchable.includes(item));
}

function addDays(date: string, days: number) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + days);
  return current.toISOString().slice(0, 10);
}

function roundQuantity(value: number, unit: Ingredient["unit"]) {
  if (unit === "unidad" || unit === "rebanada") {
    return Math.max(1, Math.round(value));
  }

  return Math.max(1, Math.round(value / 5) * 5);
}

function scaleRecipe(
  recipe: RecipeTemplate,
  scale: number,
  id: string,
): PlannedMeal {
  return {
    ...recipe,
    id,
    calories: Math.round(recipe.calories * scale),
    protein: Math.round(recipe.protein * scale),
    carbs: Math.round(recipe.carbs * scale),
    fat: Math.round(recipe.fat * scale),
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: roundQuantity(ingredient.quantity * scale, ingredient.unit),
    })),
  };
}

function flexibleMeal(dayIndex: number): PlannedMeal {
  return {
    id: `free-${dayIndex}`,
    mealType: "Cena",
    name: "Comida libre controlada",
    description:
      "Elige una comida que disfrutes, mantén una ración razonable y prioriza una fuente de proteína.",
    calories: 750,
    protein: 35,
    carbs: 85,
    fat: 28,
    ingredients: [],
    preparation: [
      "Disfruta la comida sin compensaciones extremas.",
      "Come despacio y detente cuando estés satisfecho.",
    ],
    tags: ["comida libre"],
  };
}

function totalDay(meals: PlannedMeal[]) {
  return meals.reduce(
    (total, meal) => ({
      calories: total.calories + meal.calories,
      protein: total.protein + meal.protein,
      carbs: total.carbs + meal.carbs,
      fat: total.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function generateWeeklyMealPlan(
  input: GenerateMealPlanInput,
  preferences: UserPreferences,
): MealPlanDay[] {
  const allowed = RECIPE_CATALOG.filter((recipe) =>
    recipeIsAllowed(recipe, preferences),
  );

  const byType = (mealType: RecipeTemplate["mealType"]) => {
    const recipes = allowed.filter((recipe) => recipe.mealType === mealType);
    if (recipes.length === 0) {
      throw new Error(
        `No hay recetas compatibles para ${mealType.toLowerCase()}. Revisa alergias y alimentos evitados.`,
      );
    }
    return recipes;
  };

  const mealTypes: RecipeTemplate["mealType"][] =
    input.mealsPerDay === 5
      ? ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena"]
      : ["Desayuno", "Comida", "Merienda", "Cena"];

  return DAY_LABELS.map((label, dayIndex) => {
    const trainingDay = [0, 1, 3, 5].includes(dayIndex);
    const freeMeal = input.includeFreeMeal && dayIndex === 5;

    const baseMeals = mealTypes.map((mealType, mealIndex) => {
      if (freeMeal && mealType === "Cena") return flexibleMeal(dayIndex);

      const options = byType(mealType);
      // Rotación semanal: con el catálogo ampliado evitamos repetir una receta
      // hasta agotar las opciones disponibles para ese tipo de comida.
      const offset = trainingDay && mealType === "Comida" ? 0 : 1;
      const recipe = options[(dayIndex + offset) % options.length];
      return scaleRecipe(recipe, 1, `${dayIndex}-${mealIndex}-${recipe.name}`);
    });

    const baseTotal = totalDay(baseMeals);
    const scale = Math.min(
      1.2,
      Math.max(
        0.82,
        preferences.targetCalories / Math.max(1, baseTotal.calories),
      ),
    );

    const meals = baseMeals.map((meal) =>
      meal.tags.includes("comida libre")
        ? meal
        : scaleRecipe(meal, scale, meal.id),
    );

    return {
      date: addDays(input.weekStart, dayIndex),
      label,
      trainingDay,
      freeMeal,
      meals,
      totals: totalDay(meals),
    };
  });
}

export function buildShoppingItems(days: MealPlanDay[]): ShoppingListItem[] {
  const merged = new Map<string, ShoppingListItem>();

  for (const day of days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        const key = `${normalize(ingredient.name)}:${ingredient.unit}`;
        const current = merged.get(key);

        if (current) {
          current.quantity = roundQuantity(
            current.quantity + ingredient.quantity,
            ingredient.unit,
          );
        } else {
          merged.set(key, {
            ...ingredient,
            id: crypto.randomUUID(),
            checked: false,
            manual: false,
          });
        }
      }
    }
  }

  return [...merged.values()].sort((a, b) => {
    const category = a.category.localeCompare(b.category, "es");
    return category || a.name.localeCompare(b.name, "es");
  });
}
