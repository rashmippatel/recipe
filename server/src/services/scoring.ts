import type { Recipe, IngredientOnRecipe, Ingredient } from '@prisma/client';

type RecipeWithIngredients = Recipe & { ingredients: (IngredientOnRecipe & { ingredient: Ingredient })[] };

type RecipeWithMeals = RecipeWithIngredients & { mealTypes: any };

export function computeRecipeScores(params: {
  recipes: RecipeWithMeals[];
  userIngredients: Record<string, number>;
  maxTime?: number;
  meal?: string;
  vegOnly: boolean;
  includeFamous: boolean;
}) {
  const { recipes, userIngredients, maxTime, meal, vegOnly, includeFamous } = params;

  const candidates = recipes.filter((r) => {
    if (vegOnly && !r.isVeg) return false;
    if (typeof maxTime === 'number' && r.cookTimeMin > maxTime) return false;
    return true;
  });

  const pool = includeFamous ? unionById(candidates, recipes.filter((r) => r.famous)) : candidates;

  const scored = pool.map((recipe) => {
    let covered = 0;
    let quantitySum = 0;
    const total = recipe.ingredients.length || 1;

    for (const req of recipe.ingredients) {
      const key = req.ingredient.name.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(userIngredients, key)) {
        covered += 1;
        const userQty = userIngredients[key] ?? 0;
        const suff = Math.min(1, userQty / (req.quantity || 1));
        quantitySum += suff;
      }
    }

    const meals: string[] = Array.isArray(recipe.mealTypes) ? (recipe.mealTypes as any) : [];

    const C = covered / total;
    const Q = quantitySum / total;
    const M = meal && meals.includes(meal) ? 1 : 0;
    const F = includeFamous && recipe.famous ? 1 : 0;
    const score = 0.6 * C + 0.3 * Q + 0.1 * M + 0.05 * F;

    return {
      recipe,
      score,
      breakdown: { coverage: C, quantity: Q, meal: M, famous: F },
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.recipe.cookTimeMin !== b.recipe.cookTimeMin) return a.recipe.cookTimeMin - b.recipe.cookTimeMin;
    return a.recipe.name.localeCompare(b.recipe.name);
  });

  return scored;
}

function unionById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of a) map.set(x.id, x);
  for (const x of b) if (!map.has(x.id)) map.set(x.id, x);
  return Array.from(map.values());
}

