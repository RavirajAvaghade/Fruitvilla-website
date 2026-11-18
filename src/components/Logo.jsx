import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo ${light ? 'logo-light' : ''}`} aria-label="Fruitvilla home">
      <span className="logo-mark">
        <Leaf size={20} strokeWidth={2.5} />
      </span>
      <span className="logo-text">
        <strong>Fruitvilla</strong>
        <small>Fresh Fruits, Fresh Life.</small>
      </span>
    </Link>
  );
}
