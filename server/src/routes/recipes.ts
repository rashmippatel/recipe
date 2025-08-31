import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { computeRecipeScores } from '../services/scoring.js';

const router = Router();

// Search endpoint per spec
router.get('/search', async (req, res) => {
  const ingredientsCsv = String(req.query.ingredients || '');
  const quantitiesCsv = String(req.query.quantities || '');
  const maxTime = req.query.maxTime ? Number(req.query.maxTime) : undefined;
  const meal = req.query.meal ? String(req.query.meal) : undefined;
  const vegOnly = String(req.query.vegOnly || 'false') === 'true';
  const includeFamous = String(req.query.includeFamous || 'false') === 'true';

  const ingredientNames = ingredientsCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const quantities = quantitiesCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s));

  const userIngredients: Record<string, number> = {};
  ingredientNames.forEach((name, idx) => {
    const qty = Number.isFinite(quantities[idx]) ? quantities[idx] : 0;
    userIngredients[name.toLowerCase()] = qty;
  });

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: { include: { ingredient: true } },
    },
  });

  const results = computeRecipeScores({
    recipes: recipes.map((r: any) => ({ ...r, mealTypes: (r.mealTypesCsv || '').split(',').filter(Boolean) })),
    userIngredients,
    maxTime,
    meal,
    vegOnly,
    includeFamous,
  })
    .slice(0, 3)
    .map(({ recipe, score, breakdown }) => ({
      id: recipe.id,
      name: recipe.name,
      isVeg: recipe.isVeg,
      cookTimeMin: recipe.cookTimeMin,
      mealTypes: (recipe as any).mealTypes,
      famous: recipe.famous,
      score,
      breakdown,
    }));

  res.json(results);
});

// CRUD for recipes
router.get('/', async (_req, res) => {
  const items = await prisma.recipe.findMany({ include: { ingredients: { include: { ingredient: true } } } });
  res.json(items.map((r: any) => ({ ...r, mealTypes: (r.mealTypesCsv || '').split(',').filter(Boolean) })));
});

router.get('/:id', async (req, res) => {
  const item = await prisma.recipe.findUnique({
    where: { id: String(req.params.id) },
    include: { ingredients: { include: { ingredient: true } } },
  });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const data = req.body as any;
  const created = await prisma.recipe.create({
    data: {
      name: data.name,
      isVeg: Boolean(data.isVeg),
      cookTimeMin: Number(data.cookTimeMin),
      mealTypesCsv: Array.isArray(data.mealTypes) ? data.mealTypes.join(',') : '',
      instructions: String(data.instructions || ''),
      sourceType: String(data.sourceType || 'other'),
      sourceUrl: data.sourceUrl || null,
      famous: Boolean(data.famous),
      ingredients: {
        create: (data.ingredients || []).map((ing: any) => ({
          quantity: Number(ing.quantity),
          ingredient: {
            connectOrCreate: {
              where: { name: ing.name },
              create: { name: ing.name, unit: ing.unit ?? null },
            },
          },
        })),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  });
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const id = String(req.params.id);
  const data = req.body as any;

  // Replace join rows for simplicity
  await prisma.ingredientOnRecipe.deleteMany({ where: { recipeId: id } });
  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      name: data.name,
      isVeg: Boolean(data.isVeg),
      cookTimeMin: Number(data.cookTimeMin),
      mealTypesCsv: Array.isArray(data.mealTypes) ? data.mealTypes.join(',') : '',
      instructions: String(data.instructions || ''),
      sourceType: String(data.sourceType || 'other'),
      sourceUrl: data.sourceUrl || null,
      famous: Boolean(data.famous),
      ingredients: {
        create: (data.ingredients || []).map((ing: any) => ({
          quantity: Number(ing.quantity),
          ingredient: {
            connectOrCreate: {
              where: { name: ing.name },
              create: { name: ing.name, unit: ing.unit ?? null },
            },
          },
        })),
      },
    },
    include: { ingredients: { include: { ingredient: true } } },
  });
  res.json({ ...updated, mealTypes: (updated as any).mealTypesCsv.split(',').filter(Boolean) });
});

router.delete('/:id', async (req, res) => {
  const id = String(req.params.id);
  await prisma.recipe.delete({ where: { id } });
  res.status(204).end();
});

export default router;

