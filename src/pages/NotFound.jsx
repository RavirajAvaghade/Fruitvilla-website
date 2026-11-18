import { SearchX } from 'lucide-react';
import { EmptyState } from '../components/StateViews';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        message="The page you are looking for does not exist."
        actionLabel="Back to home"
        actionTo="/"
      />
    </div>
  );
}
