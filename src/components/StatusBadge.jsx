import { statusClass } from '../services/helpers';

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${statusClass(status)}`}>{status}</span>;
}
