import { type RecipeWithIngredients, type RecipeSearchResult } from "@shared/schema";

export interface IngredientInput {
  name: string;
  quantity: number;
}

export function scoreRecipes(
  recipes: RecipeWithIngredients[],
  availableIngredients: IngredientInput[],
  maxTime?: number
): RecipeSearchResult[] {
  const availableMap = new Map<string, number>();
  
  // Normalize available ingredients (case-insensitive)
  for (const input of availableIngredients) {
    availableMap.set(input.name.toLowerCase(), input.quantity);
  }

  const scoredRecipes: RecipeSearchResult[] = recipes.map(recipe => {
    const requiredIngredients = recipe.ingredients;
    const R = requiredIngredients.length;
    
    if (R === 0) {
      return {
        ...recipe,
        score: 0,
        coverage: 0,
        quantitySatisfaction: 0,
        bonusApplied: false,
      };
    }

    // Calculate coverage: |R ∩ A| / |R|
    let availableCount = 0;
    let quantitySum = 0;
    
    for (const reqIngredient of requiredIngredients) {
      const ingredientName = reqIngredient.ingredient.name.toLowerCase();
      const availableQty = availableMap.get(ingredientName) || 0;
      
      if (availableQty > 0) {
        availableCount++;
        
        // Calculate quantity satisfaction for this ingredient
        const requiredQty = reqIngredient.quantity;
        const satisfaction = Math.min(availableQty / requiredQty, 1);
        quantitySum += satisfaction;
      }
    }

    const coverage = availableCount / R;
    const quantitySatisfaction = quantitySum / R;

    // Freshness boost: 0.1 if recipe's cookTimeMin <= maxTime/2
    let freshnessBoost = 0;
    if (maxTime && recipe.cookTimeMin <= maxTime / 2) {
      freshnessBoost = 0.1;
    }

    // Calculate base score
    let score = 0.6 * coverage + 0.3 * quantitySatisfaction + 0.1 * freshnessBoost;

    // Exact match bonus: If coverage === 1 and quantitySatisfaction === 1, add +0.25 bonus
    let bonusApplied = false;
    if (coverage === 1 && quantitySatisfaction === 1) {
      score += 0.25;
      bonusApplied = true;
    }

    // Ensure score doesn't exceed 1
    score = Math.min(score, 1);

    return {
      ...recipe,
      score,
      coverage,
      quantitySatisfaction,
      bonusApplied,
    };
  });

  // Sort by score descending and return top 3
  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
