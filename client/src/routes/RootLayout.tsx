import { Outlet, Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../shared/ThemeToggle';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            Recipe Helper
          </Link>
          <div className="flex items-center gap-4">
            <NavLink to="/find" className={({ isActive }) => (isActive ? 'underline' : '')}>Find Recipes</NavLink>
            <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'underline' : '')}>
              Favorites
            </NavLink>
            <NavLink to="/favorites/new" className={({ isActive }) => (isActive ? 'underline' : '')}>
              Add Recipe
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <main className="flex-1 mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 py-3 text-sm flex gap-4">
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
}

