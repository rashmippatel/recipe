import request from 'supertest';
import app from './index.js';

import { describe, it, expect } from 'vitest';

describe('GET /api/ingredients', () => {
  it('responds 200', async () => {
    const res = await request(app).get('/api/ingredients').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

