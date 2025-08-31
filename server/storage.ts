import { 
  type Recipe, 
  type InsertRecipe, 
  type Ingredient, 
  type InsertIngredient,
  type IngredientOnRecipe,
  type InsertIngredientOnRecipe,
  type Favorite,
  type InsertFavorite,
  type RecipeWithIngredients
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  searchIngredients(query: string): Promise<Ingredient[]>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  getOrCreateIngredient(name: string, unit?: string): Promise<Ingredient>;

  // Recipes
  getAllRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<RecipeWithIngredients | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  searchRecipes(filters: {
    ingredients?: Array<{ name: string; quantity: number }>;
    maxTime?: number;
    meal?: string;
    vegOnly?: boolean;
    includeFamous?: boolean;
  }): Promise<RecipeWithIngredients[]>;

  // Recipe Ingredients
  getRecipeIngredients(recipeId: string): Promise<Array<IngredientOnRecipe & { ingredient: Ingredient }>>;
  setRecipeIngredients(recipeId: string, ingredients: Array<{ ingredientId: string; quantity: number }>): Promise<void>;

  // Favorites
  getFavorites(): Promise<Array<Favorite & { recipe: RecipeWithIngredients }>>;
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(id: string): Promise<boolean>;
  isFavorite(recipeId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private ingredientsMap: Map<string, Ingredient> = new Map();
  private recipesMap: Map<string, Recipe> = new Map();
  private ingredientsOnRecipesMap: Map<string, IngredientOnRecipe[]> = new Map();
  private favoritesMap: Map<string, Favorite> = new Map();

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Seed ingredients
    const seedIngredients = [
      { name: "tomato", unit: "pcs" },
      { name: "onion", unit: "pcs" },
      { name: "potato", unit: "pcs" },
      { name: "egg", unit: "pcs" },
      { name: "milk", unit: "ml" },
      { name: "flour", unit: "g" },
      { name: "rice", unit: "g" },
      { name: "lentils", unit: "g" },
      { name: "spinach", unit: "g" },
      { name: "paneer", unit: "g" },
      { name: "chicken", unit: "g" },
      { name: "garlic", unit: "pcs" },
      { name: "ginger", unit: "g" },
      { name: "chili", unit: "pcs" },
      { name: "oil", unit: "ml" },
      { name: "butter", unit: "g" },
      { name: "turmeric", unit: "g" },
      { name: "cumin", unit: "g" },
      { name: "coriander", unit: "g" },
      { name: "salt", unit: "g" },
      { name: "heavy cream", unit: "ml" },
      { name: "yogurt", unit: "g" },
    ];

    for (const ingredient of seedIngredients) {
      await this.createIngredient(ingredient);
    }

    // Seed recipes
    const seedRecipes = [
      {
        name: "Butter Chicken",
        isVeg: false,
        cookTimeMin: 45,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Cut chicken into pieces and marinate with yogurt, ginger-garlic paste, and spices for 30 minutes.\n2. Heat butter in a pan and cook chicken until golden brown. Set aside.\n3. In the same pan, sauté onions until translucent, then add tomatoes and cook until soft.\n4. Blend the onion-tomato mixture into a smooth paste.\n5. Return paste to pan, add cream and cooked chicken. Simmer for 10-15 minutes.\n6. Garnish with fresh cilantro and serve hot with rice or naan.",
        sourceType: "youtube",
        sourceUrl: "https://youtube.com/watch?v=example",
        famous: true,
        ingredients: [
          { ingredient: "chicken", quantity: 500 },
          { ingredient: "tomato", quantity: 4 },
          { ingredient: "onion", quantity: 2 },
          { ingredient: "heavy cream", quantity: 200 },
          { ingredient: "butter", quantity: 50 },
          { ingredient: "garlic", quantity: 4 },
          { ingredient: "ginger", quantity: 20 },
          { ingredient: "yogurt", quantity: 100 },
        ]
      },
      {
        name: "Tomato Fried Rice",
        isVeg: true,
        cookTimeMin: 25,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Heat oil in a large pan or wok over medium-high heat.\n2. Add onions and cook until translucent.\n3. Add garlic and ginger, cook for 1 minute until fragrant.\n4. Add tomatoes and cook until soft and pulpy.\n5. Add cooked rice and mix well with the tomato mixture.\n6. Season with salt, turmeric, and other spices.\n7. Cook for 5-7 minutes, stirring frequently.\n8. Garnish with fresh coriander and serve hot.",
        sourceType: "website",
        famous: false,
        ingredients: [
          { ingredient: "rice", quantity: 200 },
          { ingredient: "tomato", quantity: 3 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "oil", quantity: 30 },
          { ingredient: "garlic", quantity: 3 },
          { ingredient: "ginger", quantity: 10 },
          { ingredient: "turmeric", quantity: 5 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Masala Omelette",
        isVeg: false,
        cookTimeMin: 15,
        mealTypes: ["Breakfast", "Evening Snack"],
        instructions: "1. Beat eggs in a bowl until well combined.\n2. Heat oil or butter in a non-stick pan over medium heat.\n3. Add chopped onions, tomatoes, and green chilies to the pan.\n4. Cook until onions are translucent and tomatoes are soft.\n5. Pour beaten eggs over the vegetable mixture.\n6. Season with salt, turmeric, and other spices.\n7. Cook until the bottom is set, then fold the omelette in half.\n8. Cook for another 1-2 minutes and serve hot.",
        sourceType: "book",
        famous: false,
        ingredients: [
          { ingredient: "egg", quantity: 3 },
          { ingredient: "tomato", quantity: 1 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "chili", quantity: 2 },
          { ingredient: "oil", quantity: 15 },
          { ingredient: "salt", quantity: 2 },
          { ingredient: "turmeric", quantity: 2 },
        ]
      },
      {
        name: "Paneer Butter Masala",
        isVeg: true,
        cookTimeMin: 35,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Cut paneer into cubes and lightly fry until golden. Set aside.\n2. Heat butter in a pan and sauté onions until golden brown.\n3. Add tomatoes, ginger, garlic, and spices. Cook until tomatoes are soft.\n4. Blend the mixture into a smooth paste and return to pan.\n5. Add cream and simmer for 5 minutes.\n6. Add fried paneer cubes and mix gently.\n7. Cook for 5-7 minutes until paneer absorbs the flavors.\n8. Garnish with fresh cilantro and serve with rice or naan.",
        sourceType: "website",
        famous: true,
        ingredients: [
          { ingredient: "paneer", quantity: 300 },
          { ingredient: "tomato", quantity: 4 },
          { ingredient: "onion", quantity: 2 },
          { ingredient: "butter", quantity: 40 },
          { ingredient: "heavy cream", quantity: 150 },
          { ingredient: "garlic", quantity: 4 },
          { ingredient: "ginger", quantity: 15 },
        ]
      },
      {
        name: "Aloo Paratha",
        isVeg: true,
        cookTimeMin: 30,
        mealTypes: ["Breakfast", "Lunch"],
        instructions: "1. Boil potatoes until tender, then mash them well.\n2. Mix mashed potatoes with spices, salt, and chopped herbs.\n3. Make dough with flour, salt, and water. Let it rest for 15 minutes.\n4. Roll out small portions of dough, place potato filling in center.\n5. Seal the edges and roll out gently into a flatbread.\n6. Cook on a hot griddle with oil until golden brown on both sides.\n7. Serve hot with yogurt, pickle, or butter.",
        sourceType: "book",
        famous: false,
        ingredients: [
          { ingredient: "potato", quantity: 4 },
          { ingredient: "flour", quantity: 200 },
          { ingredient: "oil", quantity: 30 },
          { ingredient: "cumin", quantity: 5 },
          { ingredient: "coriander", quantity: 10 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Simple Dal",
        isVeg: true,
        cookTimeMin: 40,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Wash lentils thoroughly and pressure cook with water and turmeric until soft.\n2. Heat oil in a pan and add cumin seeds.\n3. Add onions and cook until golden brown.\n4. Add tomatoes, ginger, garlic, and spices. Cook until tomatoes are soft.\n5. Add cooked lentils and simmer for 10 minutes.\n6. Adjust consistency with water if needed.\n7. Garnish with fresh cilantro and serve with rice.",
        sourceType: "other",
        famous: false,
        ingredients: [
          { ingredient: "lentils", quantity: 200 },
          { ingredient: "tomato", quantity: 2 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "oil", quantity: 20 },
          { ingredient: "garlic", quantity: 3 },
          { ingredient: "ginger", quantity: 10 },
          { ingredient: "cumin", quantity: 5 },
          { ingredient: "turmeric", quantity: 3 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Spinach Dal",
        isVeg: true,
        cookTimeMin: 35,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Wash and chop spinach leaves thoroughly.\n2. Cook lentils with turmeric until soft.\n3. Heat oil in a pan and add cumin seeds.\n4. Add onions and cook until golden.\n5. Add ginger, garlic, and green chilies.\n6. Add chopped spinach and cook until wilted.\n7. Add cooked lentils and simmer for 10 minutes.\n8. Season with salt and serve hot.",
        sourceType: "other",
        famous: false,
        ingredients: [
          { ingredient: "lentils", quantity: 150 },
          { ingredient: "spinach", quantity: 250 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "oil", quantity: 15 },
          { ingredient: "garlic", quantity: 3 },
          { ingredient: "ginger", quantity: 10 },
          { ingredient: "cumin", quantity: 5 },
          { ingredient: "turmeric", quantity: 3 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Veg Sandwich",
        isVeg: true,
        cookTimeMin: 10,
        mealTypes: ["Breakfast", "Evening Snack"],
        instructions: "1. Slice tomatoes, onions, and any other vegetables thinly.\n2. Toast bread slices lightly.\n3. Spread butter on one side of each bread slice.\n4. Layer vegetables between bread slices.\n5. Season with salt and spices.\n6. Grill or toast until golden brown.\n7. Cut diagonally and serve hot.",
        sourceType: "other",
        famous: false,
        ingredients: [
          { ingredient: "tomato", quantity: 2 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "butter", quantity: 20 },
          { ingredient: "salt", quantity: 2 },
        ]
      },
      {
        name: "Tomato Soup",
        isVeg: true,
        cookTimeMin: 20,
        mealTypes: ["Evening Snack", "Dinner"],
        instructions: "1. Heat oil in a pot and sauté onions until soft.\n2. Add tomatoes and cook until very soft.\n3. Add water and bring to a boil.\n4. Simmer for 10 minutes.\n5. Blend the mixture until smooth.\n6. Strain if desired for smooth texture.\n7. Season with salt and serve hot with croutons.",
        sourceType: "website",
        famous: false,
        ingredients: [
          { ingredient: "tomato", quantity: 6 },
          { ingredient: "onion", quantity: 1 },
          { ingredient: "oil", quantity: 15 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Chicken Curry",
        isVeg: false,
        cookTimeMin: 50,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Cut chicken into medium pieces.\n2. Heat oil in a heavy-bottomed pan.\n3. Add onions and cook until golden brown.\n4. Add ginger-garlic paste and cook for 2 minutes.\n5. Add tomatoes and cook until soft.\n6. Add chicken pieces and cook until sealed.\n7. Add spices and water, simmer covered for 25 minutes.\n8. Garnish with cilantro and serve hot.",
        sourceType: "book",
        famous: true,
        ingredients: [
          { ingredient: "chicken", quantity: 600 },
          { ingredient: "onion", quantity: 3 },
          { ingredient: "tomato", quantity: 3 },
          { ingredient: "oil", quantity: 40 },
          { ingredient: "garlic", quantity: 5 },
          { ingredient: "ginger", quantity: 20 },
          { ingredient: "turmeric", quantity: 5 },
          { ingredient: "salt", quantity: 8 },
        ]
      },
      {
        name: "Egg Fried Rice",
        isVeg: false,
        cookTimeMin: 20,
        mealTypes: ["Lunch", "Dinner"],
        instructions: "1. Beat eggs with salt and set aside.\n2. Heat oil in a wok or large pan.\n3. Pour in beaten eggs and scramble quickly. Remove and set aside.\n4. Add more oil if needed, add garlic and ginger.\n5. Add cooked rice and stir-fry for 3-4 minutes.\n6. Add scrambled eggs back to the pan.\n7. Season with salt and serve hot.",
        sourceType: "other",
        famous: false,
        ingredients: [
          { ingredient: "rice", quantity: 250 },
          { ingredient: "egg", quantity: 3 },
          { ingredient: "oil", quantity: 25 },
          { ingredient: "garlic", quantity: 3 },
          { ingredient: "ginger", quantity: 10 },
          { ingredient: "salt", quantity: 5 },
        ]
      },
      {
        name: "Poha",
        isVeg: true,
        cookTimeMin: 15,
        mealTypes: ["Breakfast"],
        instructions: "1. Rinse poha (flattened rice) gently and drain.\n2. Heat oil in a pan and add cumin seeds.\n3. Add onions and green chilies, cook until soft.\n4. Add ginger and cook for 1 minute.\n5. Add drained poha and mix gently.\n6. Season with turmeric, salt, and sugar.\n7. Cook for 5 minutes and garnish with cilantro.",
        sourceType: "other",
        famous: false,
        ingredients: [
          { ingredient: "rice", quantity: 150 }, // Using rice as substitute for poha
          { ingredient: "onion", quantity: 1 },
          { ingredient: "oil", quantity: 20 },
          { ingredient: "ginger", quantity: 10 },
          { ingredient: "chili", quantity: 2 },
          { ingredient: "turmeric", quantity: 3 },
          { ingredient: "salt", quantity: 3 },
        ]
      }
    ];

    for (const recipeData of seedRecipes) {
      const { ingredients: recipeIngredients, ...recipeInfo } = recipeData;
      const recipe = await this.createRecipe(recipeInfo as InsertRecipe);
      
      for (const ing of recipeIngredients) {
        const ingredient = await this.getOrCreateIngredient(ing.ingredient);
        await this.addIngredientToRecipe(recipe.id, ingredient.id, ing.quantity);
      }
    }
  }

  // Ingredients
  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredientsMap.values());
  }

  async searchIngredients(query: string): Promise<Ingredient[]> {
    const allIngredients = Array.from(this.ingredientsMap.values());
    const lowerQuery = query.toLowerCase();
    return allIngredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(lowerQuery)
    );
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = randomUUID();
    const ingredient: Ingredient = { 
      ...insertIngredient, 
      id,
      unit: insertIngredient.unit || null
    };
    this.ingredientsMap.set(id, ingredient);
    return ingredient;
  }

  async getOrCreateIngredient(name: string, unit?: string): Promise<Ingredient> {
    const existing = Array.from(this.ingredientsMap.values()).find(
      ing => ing.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existing) {
      return existing;
    }

    return this.createIngredient({ name: name.toLowerCase(), unit: unit || null });
  }

  // Recipes
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipesMap.values());
  }

  async getRecipe(id: string): Promise<RecipeWithIngredients | undefined> {
    const recipe = this.recipesMap.get(id);
    if (!recipe) return undefined;

    const recipeIngredients = await this.getRecipeIngredients(id);
    return {
      ...recipe,
      ingredients: recipeIngredients,
    };
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const { ingredients: _, ...recipeData } = insertRecipe;
    const id = randomUUID();
    const now = new Date();
    const recipe: Recipe = { 
      ...recipeData, 
      id, 
      createdAt: now, 
      updatedAt: now,
      sourceUrl: recipeData.sourceUrl || null
    };
    this.recipesMap.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existing = this.recipesMap.get(id);
    if (!existing) return undefined;

    const { ingredients: _, ...recipeUpdate } = updateData;
    const updated: Recipe = {
      ...existing,
      ...recipeUpdate,
      updatedAt: new Date(),
    };
    
    this.recipesMap.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const deleted = this.recipesMap.delete(id);
    if (deleted) {
      // Also delete related ingredients and favorites
      this.ingredientsOnRecipesMap.delete(id);
      for (const [favId, favorite] of Array.from(this.favoritesMap.entries())) {
        if (favorite.recipeId === id) {
          this.favoritesMap.delete(favId);
        }
      }
    }
    return deleted;
  }

  async searchRecipes(filters: {
    ingredients?: Array<{ name: string; quantity: number }>;
    maxTime?: number;
    meal?: string;
    vegOnly?: boolean;
    includeFamous?: boolean;
  }): Promise<RecipeWithIngredients[]> {
    let candidateRecipes = Array.from(this.recipesMap.values());

    // Apply hard filters
    if (filters.vegOnly) {
      candidateRecipes = candidateRecipes.filter(recipe => recipe.isVeg);
    }

    if (filters.meal) {
      candidateRecipes = candidateRecipes.filter(recipe => 
        recipe.mealTypes.includes(filters.meal!)
      );
    }

    if (filters.maxTime) {
      candidateRecipes = candidateRecipes.filter(recipe => 
        recipe.cookTimeMin <= filters.maxTime!
      );
    }

    if (filters.includeFamous === false) {
      candidateRecipes = candidateRecipes.filter(recipe => !recipe.famous);
    }

    // Get full recipe data with ingredients
    const recipesWithIngredients: RecipeWithIngredients[] = [];
    for (const recipe of candidateRecipes) {
      const ingredients = await this.getRecipeIngredients(recipe.id);
      recipesWithIngredients.push({
        ...recipe,
        ingredients,
      });
    }

    return recipesWithIngredients;
  }

  // Recipe Ingredients
  async getRecipeIngredients(recipeId: string): Promise<Array<IngredientOnRecipe & { ingredient: Ingredient }>> {
    const recipeIngredients = this.ingredientsOnRecipesMap.get(recipeId) || [];
    return recipeIngredients.map(ri => ({
      ...ri,
      ingredient: this.ingredientsMap.get(ri.ingredientId)!,
    }));
  }

  async addIngredientToRecipe(recipeId: string, ingredientId: string, quantity: number): Promise<void> {
    const existing = this.ingredientsOnRecipesMap.get(recipeId) || [];
    const newIngredient: IngredientOnRecipe = {
      id: randomUUID(),
      recipeId,
      ingredientId,
      quantity,
    };
    
    // Remove existing entry for same ingredient if exists
    const filtered = existing.filter(ri => ri.ingredientId !== ingredientId);
    this.ingredientsOnRecipesMap.set(recipeId, [...filtered, newIngredient]);
  }

  async setRecipeIngredients(recipeId: string, ingredients: Array<{ ingredientId: string; quantity: number }>): Promise<void> {
    const recipeIngredients: IngredientOnRecipe[] = ingredients.map(ing => ({
      id: randomUUID(),
      recipeId,
      ingredientId: ing.ingredientId,
      quantity: ing.quantity,
    }));
    
    this.ingredientsOnRecipesMap.set(recipeId, recipeIngredients);
  }

  // Favorites
  async getFavorites(): Promise<Array<Favorite & { recipe: RecipeWithIngredients }>> {
    const favorites = Array.from(this.favoritesMap.values());
    const result = [];
    
    for (const favorite of favorites) {
      const recipe = await this.getRecipe(favorite.recipeId);
      if (recipe) {
        result.push({
          ...favorite,
          recipe,
        });
      }
    }
    
    return result;
  }

  async addToFavorites(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      note: insertFavorite.note || null,
      createdAt: new Date(),
    };
    this.favoritesMap.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(id: string): Promise<boolean> {
    return this.favoritesMap.delete(id);
  }

  async isFavorite(recipeId: string): Promise<boolean> {
    return Array.from(this.favoritesMap.values()).some(fav => fav.recipeId === recipeId);
  }
}

export const storage = new MemStorage();
