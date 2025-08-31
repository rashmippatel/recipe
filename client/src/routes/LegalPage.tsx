import { useParams } from 'react-router-dom';

export default function LegalPage() {
  const { page } = useParams();
  return (
    <div className="prose dark:prose-invert">
      <h1>{page === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</h1>
      <p>Placeholder content.</p>
    </div>
  );
}

