import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <section className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-semibold mb-2">Recipe Helper</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Find recipes that match your ingredients, time, and preferences. Save your favorites and manage your
          personal recipe database.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/find" className="px-4 py-2 rounded bg-blue-600 text-white">
            Find Recipes
          </Link>
          <Link to="/favorites/new" className="px-4 py-2 rounded border border-blue-600 text-blue-600">
            Add Recipe
          </Link>
        </div>
      </section>
    </div>
  );
}

