import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="grid gap-2">
      <h1 className="text-xl font-semibold">404 - Page not found</h1>
      <p>
        Try going back to the <Link className="underline" to="/">home page</Link> or use the navigation above.
      </p>
    </div>
  );
}

