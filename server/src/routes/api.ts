import { Router } from 'express';
import ingredientsRouter from './ingredients.js';
import recipesRouter from './recipes.js';
import favoritesRouter from './favorites.js';

export const router = Router();
router.use('/ingredients', ingredientsRouter);
router.use('/recipes', recipesRouter);
router.use('/favorites', favoritesRouter);

