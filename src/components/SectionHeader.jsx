import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({ eyebrow, title, subtitle, linkTo, linkLabel = 'View all' }) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="link-arrow">
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
