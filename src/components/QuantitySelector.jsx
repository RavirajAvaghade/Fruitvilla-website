import { Minus, Plus } from 'lucide-react';
import { qtyStep } from '../services/helpers';

export default function QuantitySelector({ value, unit, onChange, min, max = 50, size = 'md', disabled = false }) {
  const step = qtyStep(unit);
  const lower = min ?? step;
  const dec = () => onChange(Math.max(lower, Math.round((value - step) * 100) / 100));
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 100) / 100));
  return (
    <div className={`qty qty-${size} ${disabled ? 'is-disabled' : ''}`}>
      <button type="button" onClick={dec} disabled={disabled || value <= lower} aria-label="Decrease quantity">
        <Minus size={size === 'sm' ? 14 : 16} />
      </button>
      <span className="qty-value" aria-live="polite">
        {value}
        <small>{unit === 'kg' ? ' kg' : ''}</small>
      </span>
      <button type="button" onClick={inc} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Plus size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
}
