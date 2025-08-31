export interface SelectedIngredient {
  id: string;
  name: string;
  unit: string | null;
  quantity: number;
}

export interface RecipeFilters {
  ingredients: SelectedIngredient[];
  maxTime?: number;
  meal?: string;
  vegOnly: boolean;
  includeFamous: boolean;
}

export interface ScoreBreakdown {
  coverage: number;
  quantitySatisfaction: number;
  bonusApplied: boolean;
  finalScore: number;
}
