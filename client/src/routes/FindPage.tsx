import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

const schema = z.object({
  ingredients: z.array(
    z.object({ name: z.string().min(1), quantity: z.number().nonnegative().default(0), unit: z.string().nullable() })
  ),
  maxTime: z.number().int().positive().optional(),
  meal: z.enum(['Breakfast', 'Lunch', 'Evening Snack', 'Dinner']).optional(),
  vegOnly: z.boolean().default(false),
  includeFamous: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

type Ingredient = { id: string; name: string; unit: string | null };
type RecipeHit = {
  id: string;
  name: string;
  isVeg: boolean;
  cookTimeMin: number;
  mealTypes: string[];
  famous: boolean;
  score: number;
  breakdown: { coverage: number; quantity: number; meal: number; famous: number };
};

export default function FindPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ingredients: [], vegOnly: false, includeFamous: false },
  });

  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Ingredient[]>([]);
  const [results, setResults] = useState<RecipeHit[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const res = await axios.get<Ingredient[]>('/api/ingredients', { params: { query }, signal: controller.signal });
      setOptions(res.data);
    };
    run().catch(() => {});
    return () => controller.abort();
  }, [query]);

  const onSubmit = async (values: FormValues) => {
    const ingredients = values.ingredients.map((i) => i.name).join(',');
    const quantities = values.ingredients.map((i) => i.quantity).join(',');
    const params: any = {
      ingredients,
      quantities,
      vegOnly: values.vegOnly,
      includeFamous: values.includeFamous,
    };
    if (values.maxTime) params.maxTime = values.maxTime;
    if (values.meal) params.meal = values.meal;
    const res = await axios.get<RecipeHit[]>('/api/recipes/search', { params });
    setResults(res.data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 p-4 rounded border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div>
            <label className="font-medium">Ingredients on hand</label>
            <input
              className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="Search ingredient"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Controller
              control={control}
              name="ingredients"
              render={({ field }) => (
                <div className="mt-2 grid gap-2">
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-2 border px-2 py-1 rounded">
                        <span>{i.name}</span>
                        <input
                          type="number"
                          step="0.1"
                          className="w-20 bg-transparent border rounded px-1 py-0.5"
                          value={i.quantity}
                          onChange={(e) => {
                            const copy = [...field.value];
                            copy[idx] = { ...copy[idx], quantity: Number(e.target.value) };
                            field.onChange(copy);
                          }}
                          aria-label={`Quantity for ${i.name}`}
                        />
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => field.onChange(field.value.filter((_, j) => j !== idx))}
                          aria-label={`Remove ${i.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {options.length > 0 && (
                    <div className="max-h-40 overflow-auto border rounded">
                      {options.map((o) => (
                        <button
                          type="button"
                          key={o.id}
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            if (!field.value.find((v) => v.name === o.name)) {
                              field.onChange([...field.value, { name: o.name, quantity: 0, unit: o.unit }]);
                            }
                          }}
                        >
                          {o.name} {o.unit ? `(${o.unit})` : ''}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <label className="font-medium">Max cook time (minutes)</label>
            <Controller
              control={control}
              name="maxTime"
              render={({ field }) => (
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </div>

          <div>
            <label className="font-medium">Meal of the day</label>
            <Controller
              control={control}
              name="meal"
              render={({ field }) => (
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'].map((m) => (
                    <label key={m} className="flex items-center gap-2">
                      <input type="radio" checked={field.value === m} onChange={() => field.onChange(m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="vegOnly"
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  <span>Veg only</span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="includeFamous"
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  <span>Include famous recipes</span>
                </label>
              )}
            />
          </div>

          <button className="px-4 py-2 rounded bg-blue-600 text-white" type="submit">
            Search
          </button>
          {Object.keys(errors).length > 0 && <div className="text-red-600">Fix form errors</div>}
        </form>
      </div>

      <div className="md:col-span-2 grid gap-3">
        {results.length === 0 ? (
          <div className="text-gray-500">No results yet. Fill filters and search.</div>
        ) : (
          results.map((r) => (
            <div key={r.id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {r.name}{' '}
                  <span className="text-xs ml-2 px-2 py-0.5 border rounded">Score: {r.score.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {r.cookTimeMin} min · {r.isVeg ? 'Veg' : 'Non-veg'} · {r.mealTypes.join(', ')}
                </div>
              </div>
              <div className="flex gap-2">
                <a className="px-3 py-1 rounded border" href={`/favorites`}>View</a>
                <FavoriteButton recipeId={r.id} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FavoriteButton({ recipeId }: { recipeId: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <button
      disabled={saving}
      className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
      onClick={async () => {
        setSaving(true);
        try {
          await axios.post('/api/favorites', { recipeId });
          setSaved(true);
        } finally {
          setSaving(false);
        }
      }}
    >
      {saved ? 'Saved' : saving ? 'Saving...' : 'Save to Favorites'}
    </button>
  );
}

