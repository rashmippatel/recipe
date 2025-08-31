import { Router } from 'express';
import { prisma } from '../services/prisma.js';

const router = Router();

router.post('/', async (req, res) => {
  const { recipeId, note } = req.body as { recipeId: string; note?: string };
  const fav = await prisma.favorite.upsert({
    where: { recipeId },
    create: { recipeId, note: note ?? null },
    update: { note: note ?? null },
    include: { recipe: true },
  });
  res.status(201).json(fav);
});

router.get('/', async (_req, res) => {
  const list = await prisma.favorite.findMany({ include: { recipe: true }, orderBy: { createdAt: 'desc' } });
  res.json(
    list.map((f: any) => ({
      ...f,
      recipe: { ...f.recipe, mealTypes: (f.recipe.mealTypesCsv || '').split(',').filter(Boolean) },
    }))
  );
});

router.get('/:id', async (req, res) => {
  const id = String(req.params.id);
  const fav = await prisma.favorite.findUnique({
    where: { id },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  });
  if (!fav) return res.status(404).json({ error: 'Not found' });
  res.json({
    ...fav,
    recipe: {
      ...fav.recipe,
      mealTypes: (fav.recipe as any).mealTypesCsv.split(',').filter(Boolean),
    },
  });
});

router.patch('/:id', async (req, res) => {
  const id = String(req.params.id);
  const { note } = req.body as { note?: string };
  const fav = await prisma.favorite.update({ where: { id }, data: { note: note ?? null }, include: { recipe: true } });
  res.json(fav);
});

router.delete('/:id', async (req, res) => {
  const id = String(req.params.id);
  await prisma.favorite.delete({ where: { id } });
  res.status(204).end();
});

export default router;

