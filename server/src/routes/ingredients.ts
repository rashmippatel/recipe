import { Router } from 'express';
import { prisma } from '../services/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const query = String(req.query.query || '').trim();
  if (!query) {
    const items = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      take: 50,
    });
    return res.json(items);
  }
  const items = await prisma.ingredient.findMany({
    where: { name: { contains: query } },
    orderBy: { name: 'asc' },
    take: 50,
  });
  res.json(items);
});

export default router;

