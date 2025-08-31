import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

type Favorite = {
  id: string;
  note: string | null;
  createdAt: string;
  recipe: { id: string; name: string; isVeg: boolean; mealTypes: string[]; cookTimeMin: number };
};

export default function FavoritesListPage() {
  const [data, setData] = useState<Favorite[]>([]);
  const [q, setQ] = useState('');
  const [veg, setVeg] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [meal, setMeal] = useState('');

  useEffect(() => {
    axios.get<Favorite[]>('/api/favorites').then((res) => setData(res.data));
  }, []);

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const s = `${f.recipe.name} ${f.note ?? ''}`.toLowerCase();
      if (q && !s.includes(q.toLowerCase())) return false;
      if (veg === 'veg' && !f.recipe.isVeg) return false;
      if (veg === 'non-veg' && f.recipe.isVeg) return false;
      if (meal && !f.recipe.mealTypes.includes(meal)) return false;
      return true;
    });
  }, [data, q, veg, meal]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm">Search</label>
          <input
            className="px-3 py-2 rounded border bg-transparent"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="name or note"
          />
        </div>
        <div>
          <label className="block text-sm">Veg</label>
          <select className="px-3 py-2 rounded border bg-transparent" value={veg} onChange={(e) => setVeg(e.target.value as any)}>
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Meal</label>
          <select className="px-3 py-2 rounded border bg-transparent" value={meal} onChange={(e) => setMeal(e.target.value)}>
            <option value="">All</option>
            {['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <Link to="/favorites/new" className="ml-auto px-4 py-2 rounded bg-blue-600 text-white">
          Add new
        </Link>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Veg</th>
              <th className="p-2 border">Meal</th>
              <th className="p-2 border">Cook Time</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="p-2 border">{f.recipe.name}</td>
                <td className="p-2 border">{f.recipe.isVeg ? 'Veg' : 'Non-veg'}</td>
                <td className="p-2 border">{f.recipe.mealTypes.join(', ')}</td>
                <td className="p-2 border">{f.recipe.cookTimeMin} min</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <Link to={`/favorites/${f.id}`} className="px-2 py-1 rounded border">
                      View
                    </Link>
                    <Link to={`/favorites/${f.id}/edit`} className="px-2 py-1 rounded border">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

