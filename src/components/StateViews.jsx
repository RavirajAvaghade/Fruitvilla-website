import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, PackageOpen } from 'lucide-react';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="state-view" role="status">
      <Loader2 size={32} className="spin" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, actionTo, onAction, icon }) {
  const Icon = icon || PackageOpen;
  return (
    <div className="state-view">
      <div className="state-icon"><Icon size={34} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-view state-error" role="alert">
      <div className="state-icon"><AlertTriangle size={34} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}
