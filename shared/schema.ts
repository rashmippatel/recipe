import { z } from "zod";

// Base models for in-memory storage
export interface Ingredient {
  id: string;
  name: string;
  unit: string | null; // "g" | "ml" | "pcs" | null
}

export interface Recipe {
  id: string;
  name: string;
  isVeg: boolean;
  cookTimeMin: number;
  mealTypes: string[]; // ["Breakfast","Lunch","Evening Snack","Dinner"]
  instructions: string;
  sourceType: string; // "website" | "youtube" | "book" | "other"
  sourceUrl: string | null;
  famous: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface IngredientOnRecipe {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: number;
}

export interface Favorite {
  id: string;
  recipeId: string;
  note: string | null;
  createdAt: Date | null;
}

// Insert schemas
export const insertIngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  unit: z.string().nullable().optional(),
});

export const insertRecipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  isVeg: z.boolean().default(true),
  cookTimeMin: z.number().min(1, "Cook time must be at least 1 minute"),
  mealTypes: z.array(z.string()).min(1, "At least one meal type is required"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  sourceType: z.enum(["website", "youtube", "book", "other"]).default("other"),
  sourceUrl: z.string().url().nullable().optional(),
  famous: z.boolean().default(false),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number().positive(),
  })).optional(),
});

export const insertIngredientOnRecipeSchema = z.object({
  recipeId: z.string(),
  ingredientId: z.string(),
  quantity: z.number().positive(),
});

export const insertFavoriteSchema = z.object({
  recipeId: z.string(),
  note: z.string().nullable().optional(),
});

// Types
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type InsertIngredientOnRecipe = z.infer<typeof insertIngredientOnRecipeSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Extended types for API responses
export type RecipeWithIngredients = Recipe & {
  ingredients: Array<IngredientOnRecipe & {
    ingredient: Ingredient;
  }>;
};

export type RecipeSearchResult = RecipeWithIngredients & {
  score: number;
  coverage: number;
  quantitySatisfaction: number;
  bonusApplied: boolean;
};
