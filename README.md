# Recipe Helper

Full-stack web app with two workflows:
- Find Recipes based on ingredients/time/preferences with deterministic scoring.
- Favorites DB with full CRUD for recipes and a favorites list.

## Tech Stack
- Frontend: Vite + React + TypeScript, Tailwind CSS, React Router, React Hook Form + Zod, TanStack Query.
- Backend: Node + Express + TypeScript.
- DB: SQLite via Prisma ORM.
- Testing: Vitest + RTL (frontend), supertest (backend), axe for a11y checks.
- Quality: ESLint + Prettier; strict TS.

## Monorepo Structure
```
client/   # Vite React app
server/   # Express + Prisma API
```

## Scripts
- `npm run dev` – concurrently runs client and server (with Prisma).
- `npm run build` – builds client and server.
- `npm start` – starts production server (also serves built client).
- `npm test` – runs backend and frontend tests.
- `npm run db:reset` – resets DB (migrate reset + seed).

## Environment
No env vars are required by default. SQLite DB file lives at `server/prisma/dev.db`.

## Assumptions
- Ingredient units are simple: `g`, `ml`, or `pcs`; some ingredients may have `null` unit and use raw numeric quantities.
- Deterministic score formula (for /recipes/search):
  - Filter out recipes exceeding `maxTime` and non-veg when `vegOnly=true`.
  - Candidate pool includes all matching recipes plus any with `famous=true` when `includeFamous=true`.
  - Matching score S is computed per recipe:
    - Ingredient coverage C: fraction of recipe ingredients present in the user list.
    - Quantity sufficiency Q: average min(1, userQty/neededQty) over recipe ingredients that are present; 0 for missing.
    - Meal bonus M: 1 if requested meal is in the recipe meal types, else 0.
    - Famous bonus F: 1 if recipe is famous and `includeFamous=true`, else 0.
    - Final score: `S = 0.6*C + 0.3*Q + 0.1*M + 0.05*F`. Ties broken by lower cook time then name.
- Favorites are stored in a `Favorite` table referencing `Recipe`. Deleting a recipe removes its favorite.
- Client saves a favorite by calling `POST /api/favorites { recipeId, note? }`. Creating new recipes uses `/api/recipes`.
- Dark mode respects system prefers-color-scheme but can be toggled in UI (stored in localStorage).
- Basic search on `/favorites` is client-side; server supports simple query params for extensibility.

## Development
1. Install dependencies: `npm install` (root installs both workspaces via prefix scripts).
2. Setup DB: `npm run db:reset`.
3. Start dev: `npm run dev`.
4. Open client at `http://localhost:5173`, server at `http://localhost:3000`.

## Production
1. `npm run build`
2. `npm start`
3. Server serves static client build from `client/dist` at `/`.

## API (prefix: /api)
- `GET /ingredients?query=tom` – fuzzy search ingredients by name.
- `GET /recipes/search?ingredients=tomato,onion&quantities=100,1&maxTime=30&meal=Dinner&vegOnly=true&includeFamous=true`
  - Returns top 3 recipes with breakdown and score.
- Recipes CRUD:
  - `GET /recipes`, `POST /recipes`, `GET /recipes/:id`, `PUT /recipes/:id`, `DELETE /recipes/:id`
- Favorites:
  - `POST /favorites { recipeId, note? }`
  - `GET /favorites`
  - `GET /favorites/:id`
  - `PATCH /favorites/:id { note? }`
  - `DELETE /favorites/:id`

## Testing
- Backend: `npm --prefix server test`
- Frontend: `npm --prefix client test`

## Accessibility
- Components follow keyboard and ARIA best practices where applicable.
- Tests run axe checks on key pages.

# recipe