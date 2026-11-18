import { AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Shown only when localStorage fails (blocked, private mode or full).
export default function StorageNotice() {
  const { saveError } = useStore();
  if (!saveError) return null;
  return (
    <div className="storage-notice" role="alert">
      <AlertTriangle size={16} /> {saveError} Your changes may not be saved after refresh.
    </div>
  );
}
