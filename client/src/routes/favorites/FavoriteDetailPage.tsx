import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

type Favorite = {
  id: string;
  note: string | null;
  recipe: {
    id: string;
    name: string;
    isVeg: boolean;
    mealTypes: string[];
    cookTimeMin: number;
    instructions: string;
    sourceType: string;
    sourceUrl: string | null;
    ingredients: { quantity: number; ingredient: { name: string; unit: string | null } }[];
  };
};

export default function FavoriteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fav, setFav] = useState<Favorite | null>(null);

  useEffect(() => {
    axios.get<Favorite>(`/api/favorites/${id}`).then((res) => setFav(res.data));
  }, [id]);

  if (!fav) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{fav.recipe.name}</h1>
        <div className="flex gap-2">
          <Link to={`/favorites/${fav.id}/edit`} className="px-3 py-1 rounded border">
            Edit
          </Link>
          <button
            className="px-3 py-1 rounded border border-red-600 text-red-600"
            onClick={async () => {
              await axios.delete(`/api/favorites/${fav.id}`);
              navigate('/favorites');
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {fav.recipe.isVeg ? 'Veg' : 'Non-veg'} · {fav.recipe.mealTypes.join(', ')} · {fav.recipe.cookTimeMin} min
      </div>
      <div>
        <h2 className="font-medium">Ingredients</h2>
        <ul className="list-disc ml-6">
          {fav.recipe.ingredients.map((i, idx) => (
            <li key={idx}>
              {i.ingredient.name}: {i.quantity}
              {i.ingredient.unit ? ` ${i.ingredient.unit}` : ''}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-medium">Instructions</h2>
        <p className="whitespace-pre-wrap">{fav.recipe.instructions}</p>
      </div>
      {fav.recipe.sourceUrl && (
        <a className="text-blue-600 underline" href={fav.recipe.sourceUrl} target="_blank" rel="noreferrer">
          Source
        </a>
      )}
    </div>
  );
}

