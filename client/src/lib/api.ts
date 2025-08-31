import { apiRequest } from "./queryClient";
import type { 
  Recipe, 
  Ingredient, 
  RecipeWithIngredients, 
  RecipeSearchResult,
  InsertRecipe,
  InsertFavorite,
  Favorite
} from "@shared/schema";
import type { RecipeFilters } from "../types/recipe";

export const api = {
  // Ingredients
  searchIngredients: async (query: string): Promise<Ingredient[]> => {
    const response = await apiRequest("GET", `/api/ingredients?query=${encodeURIComponent(query)}`);
    return response.json();
  },

  getAllIngredients: async (): Promise<Ingredient[]> => {
    const response = await apiRequest("GET", "/api/ingredients");
    return response.json();
  },

  createIngredient: async (data: { name: string; unit?: string }): Promise<Ingredient> => {
    const response = await apiRequest("POST", "/api/ingredients", data);
    return response.json();
  },

  // Recipe search
  searchRecipes: async (filters: RecipeFilters): Promise<RecipeSearchResult[]> => {
    const params = new URLSearchParams();
    
    if (filters.ingredients.length > 0) {
      params.set("ingredients", filters.ingredients.map(i => i.name).join(","));
      params.set("quantities", filters.ingredients.map(i => i.quantity.toString()).join(","));
    }
    
    if (filters.maxTime) {
      params.set("maxTime", filters.maxTime.toString());
    }
    
    if (filters.meal) {
      params.set("meal", filters.meal);
    }
    
    params.set("vegOnly", filters.vegOnly.toString());
    params.set("includeFamous", filters.includeFamous.toString());

    const response = await apiRequest("GET", `/api/recipes/search?${params.toString()}`);
    return response.json();
  },

  // Recipes CRUD
  getRecipe: async (id: string): Promise<RecipeWithIngredients> => {
    const response = await apiRequest("GET", `/api/recipes/${id}`);
    return response.json();
  },

  createRecipe: async (data: InsertRecipe): Promise<RecipeWithIngredients> => {
    const response = await apiRequest("POST", "/api/recipes", data);
    return response.json();
  },

  updateRecipe: async (id: string, data: Partial<InsertRecipe>): Promise<RecipeWithIngredients> => {
    const response = await apiRequest("PUT", `/api/recipes/${id}`, data);
    return response.json();
  },

  deleteRecipe: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/recipes/${id}`);
  },

  // Favorites
  getFavorites: async (): Promise<Array<Favorite & { recipe: RecipeWithIngredients }>> => {
    const response = await apiRequest("GET", "/api/favorites");
    return response.json();
  },

  addToFavorites: async (data: InsertFavorite): Promise<Favorite> => {
    const response = await apiRequest("POST", "/api/favorites", data);
    return response.json();
  },

  removeFromFavorites: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/favorites/${id}`);
  },
};
