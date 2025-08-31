import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const schema = z.object({
  name: z.string().min(1),
  isVeg: z.boolean(),
  cookTimeMin: z.number().int().positive(),
  mealTypes: z.array(z.enum(['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'])).nonempty(),
  instructions: z.string().min(1),
  sourceType: z.enum(['website', 'youtube', 'book', 'other']).default('other'),
  sourceUrl: z.string().url().nullable().optional(),
  famous: z.boolean().default(false),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        unit: z.string().nullable().optional(),
        quantity: z.number().positive(),
      })
    )
    .min(1),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function FavoriteEditPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { ingredients: [], mealTypes: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

  useEffect(() => {
    if (mode === 'edit' && id) {
      axios.get(`/api/favorites/${id}`).then((res) => {
        const f = res.data;
        setValue('name', f.recipe.name);
        setValue('isVeg', f.recipe.isVeg);
        setValue('cookTimeMin', f.recipe.cookTimeMin);
        setValue('mealTypes', f.recipe.mealTypes);
        setValue('instructions', f.recipe.instructions);
        setValue('sourceType', f.recipe.sourceType);
        setValue('sourceUrl', f.recipe.sourceUrl);
        setValue('ingredients', f.recipe.ingredients.map((i: any) => ({ name: i.ingredient.name, unit: i.ingredient.unit, quantity: i.quantity })));
      });
    }
  }, [id, mode, setValue]);

  const onSubmit = async (values: FormValues) => {
    // Create or update Recipe, then ensure favorite exists
    if (mode === 'create') {
      const created = await axios.post('/api/recipes', values);
      await axios.post('/api/favorites', { recipeId: created.data.id, note: values.note });
      navigate(`/favorites`);
    } else if (mode === 'edit' && id) {
      const existing = await axios.get(`/api/favorites/${id}`);
      await axios.put(`/api/recipes/${existing.data.recipe.id}`, values);
      if (values.note !== undefined) {
        await axios.patch(`/api/favorites/${id}`, { note: values.note });
      }
      navigate(`/favorites/${id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <label>Name</label>
        <input className="px-3 py-2 rounded border bg-transparent" {...register('name')} />
        {errors.name && <span className="text-red-600">{errors.name.message}</span>}
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('isVeg')} /> Veg
        </label>
        <label>
          Cook Time (min)
          <input type="number" className="ml-2 px-3 py-2 rounded border bg-transparent" {...register('cookTimeMin', { valueAsNumber: true })} />
        </label>
      </div>
      <div>
        <label className="block">Meal Types</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'].map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input type="checkbox" value={m} {...register('mealTypes')} />
              {m}
            </label>
          ))}
        </div>
        {errors.mealTypes && <span className="text-red-600">Select at least one</span>}
      </div>
      <div>
        <label className="block">Ingredients</label>
        <div className="grid gap-2">
          {fields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2">
              <input className="px-2 py-1 border rounded bg-transparent" placeholder="name" {...register(`ingredients.${idx}.name` as const)} />
              <input className="px-2 py-1 border rounded bg-transparent" placeholder="unit" {...register(`ingredients.${idx}.unit` as const)} />
              <input type="number" className="px-2 py-1 border rounded bg-transparent w-32" placeholder="quantity" {...register(`ingredients.${idx}.quantity` as const, { valueAsNumber: true })} />
              <button type="button" className="text-red-600" onClick={() => remove(idx)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="px-2 py-1 rounded border" onClick={() => append({ name: '', unit: '', quantity: 0 })}>
            Add ingredient
          </button>
        </div>
      </div>
      <div>
        <label className="block">Instructions</label>
        <textarea className="w-full h-32 px-3 py-2 border rounded bg-transparent" {...register('instructions')} />
      </div>
      <div className="flex flex-wrap gap-4">
        <label>
          Source Type
          <select className="ml-2 px-3 py-2 rounded border bg-transparent" {...register('sourceType')}>
            {['website', 'youtube', 'book', 'other'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source URL
          <input className="ml-2 px-3 py-2 rounded border bg-transparent" {...register('sourceUrl')} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('famous')} /> Famous
        </label>
      </div>
      <div>
        <label className="block">Note (for favorite)</label>
        <input className="px-3 py-2 rounded border bg-transparent w-full" {...register('note')} />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" type="submit">
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  );
}

