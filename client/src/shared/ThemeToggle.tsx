import { useEffect, useState } from 'react';

function getInitialDark(): boolean {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark());
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return (
    <button
      type="button"
      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      aria-label="Toggle theme"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}

