import { Link } from 'react-router-dom';
import { ShoppingCart, Tag } from 'lucide-react';
import FruitImage from './FruitImage';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { discountPercent, formatINR, unitLabel, qtyStep } from '../services/helpers';

export default function FruitCard({ product }) {
  const { addToCart, openDrawer } = useCart();
  const toast = useToast();
  const off = discountPercent(product);

  function handleAdd(e) {
    e.preventDefault();
    const res = addToCart(product, qtyStep(product.unit));
    if (res.ok) {
      toast.success(`${product.name} added to cart`);
      openDrawer();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <article className={`fruit-card ${product.available ? '' : 'is-soldout'}`}>
      <Link to={`/fruits/${product.id}`} className="fruit-card-media" aria-label={`View ${product.name}`}>
        <FruitImage product={product} />
        <span className={`avail-badge ${product.available ? 'in' : 'out'}`}>
          {product.available ? 'Available' : 'Out of Stock'}
        </span>
        {off > 0 && product.available && (
          <span className="off-badge"><Tag size={12} /> {off}% OFF</span>
        )}
      </Link>
      <div className="fruit-card-body">
        <span className="fruit-card-cat">{product.category}</span>
        <h3 className="fruit-card-name">
          <Link to={`/fruits/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="fruit-card-bottom">
          <div className="price-block">
            <span className="price">{formatINR(product.price)}</span>
            <span className="unit">{unitLabel(product.unit)}</span>
            {off > 0 && <span className="mrp">{formatINR(product.mrp)}</span>}
          </div>
          <button
            type="button"
            className="btn btn-add"
            onClick={handleAdd}
            disabled={!product.available}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={16} />
            <span>{product.available ? 'Add' : 'Sold out'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
