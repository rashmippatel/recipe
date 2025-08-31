import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreRecipes } from "./services/recipe-matching";
import { z } from "zod";
import { insertRecipeSchema, insertFavoriteSchema, insertIngredientSchema } from "@shared/schema";

const searchParamsSchema = z.object({
  ingredients: z.string().optional(),
  quantities: z.string().optional(),
  maxTime: z.coerce.number().optional(),
  meal: z.string().optional(),
  vegOnly: z.coerce.boolean().optional(),
  includeFamous: z.coerce.boolean().optional(),
});

const createRecipeSchema = insertRecipeSchema;

export async function registerRoutes(app: Express): Promise<Server> {
  // Recipe search endpoint
  app.get("/api/recipes/search", async (req, res) => {
    try {
      const params = searchParamsSchema.parse(req.query);
      
      let availableIngredients: Array<{ name: string; quantity: number }> = [];
      
      if (params.ingredients && params.quantities) {
        const ingredientNames = params.ingredients.split(",").map(s => s.trim());
        const quantities = params.quantities.split(",").map(s => parseFloat(s.trim()));
        
        if (ingredientNames.length !== quantities.length) {
          return res.status(400).json({ 
            message: "Ingredients and quantities arrays must have the same length" 
          });
        }
        
        availableIngredients = ingredientNames.map((name, index) => ({
          name,
          quantity: quantities[index] || 0,
        }));
      }

      const recipes = await storage.searchRecipes({
        ingredients: availableIngredients,
        maxTime: params.maxTime,
        meal: params.meal,
        vegOnly: params.vegOnly,
        includeFamous: params.includeFamous,
      });

      const scoredRecipes = scoreRecipes(recipes, availableIngredients, params.maxTime);
      
      res.json(scoredRecipes);
    } catch (error) {
      res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Ingredient search endpoint
  app.get("/api/ingredients", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (typeof query === "string" && query.trim()) {
        const ingredients = await storage.searchIngredients(query);
        res.json(ingredients);
      } else {
        const ingredients = await storage.getIngredients();
        res.json(ingredients);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  // Recipe CRUD endpoints
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const data = createRecipeSchema.parse(req.body);
      
      // Create the recipe
      const recipe = await storage.createRecipe(data);
      
      // Add ingredients to recipe
      if (data.ingredients && data.ingredients.length > 0) {
        await storage.setRecipeIngredients(recipe.id, data.ingredients);
      }
      
      const fullRecipe = await storage.getRecipe(recipe.id);
      res.status(201).json(fullRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.put("/api/recipes/:id", async (req, res) => {
    try {
      const data = createRecipeSchema.partial().parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, data);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // Update ingredients if provided
      if (data.ingredients) {
        await storage.setRecipeIngredients(recipe.id, data.ingredients);
      }
      
      const fullRecipe = await storage.getRecipe(recipe.id);
      res.json(fullRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRecipe(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Favorites endpoints
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const data = insertFavoriteSchema.parse(req.body);
      const favorite = await storage.addToFavorites(data);
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const deleted = await storage.removeFromFavorites(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Create new ingredient endpoint
  app.post("/api/ingredients", async (req, res) => {
    try {
      const data = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(data);
      res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create ingredient" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
