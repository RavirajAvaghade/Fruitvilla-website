import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Zap, Truck, ShieldCheck, Leaf } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import QuantitySelector from '../components/QuantitySelector';
import FruitGrid from '../components/FruitGrid';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { discountPercent, formatINR, qtyStep, round2, unitLabel } from '../services/helpers';

export default function FruitDetails() {
  const { id } = useParams();
  const { products, getProduct } = useStore();
  const { addToCart, openDrawer } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const product = getProduct(id);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) setQty(qtyStep(product.unit));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return (
      <div className="container page">
        <EmptyState
          title="Fruit not found"
          message="This fruit may have been removed from the store."
          actionLabel="Browse all fruits"
          actionTo="/fruits"
        />
      </div>
    );
  }

  const off = discountPercent(product);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 5);

  function add() {
    const res = addToCart(product, qty);
    if (res.ok) {
      toast.success(`${product.name} added to cart`);
      openDrawer();
    } else toast.error(res.error);
  }

  function buyNow() {
    const res = addToCart(product, qty);
    if (res.ok) navigate('/checkout');
    else toast.error(res.error);
  }

  return (
    <div className="container page">
      <Link to="/fruits" className="back-link"><ArrowLeft size={16} /> Back to all fruits</Link>

      <div className="details">
        <div className="details-media">
          <FruitImage product={product} eager />
          <span className={`avail-badge ${product.available ? 'in' : 'out'}`}>
            {product.available ? 'Available' : 'Out of Stock'}
          </span>
          {off > 0 && product.available && <span className="off-badge">{off}% OFF</span>}
        </div>

        <div className="details-info">
          <span className="fruit-card-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="details-price">
            <span className="price">{formatINR(product.price)}</span>
            <span className="unit">{unitLabel(product.unit)}</span>
            {off > 0 && <span className="mrp">{formatINR(product.mrp)}</span>}
          </div>
          <p className="details-desc">{product.description || 'Fresh and delicious.'}</p>

          <ul className="details-meta">
            <li><span>Unit</span><strong>Per {product.unit}</strong></li>
            <li>
              <span>Availability</span>
              <strong className={product.available ? 'text-green' : 'text-red'}>
                {product.available ? 'In stock' : 'Out of stock'}
              </strong>
            </li>
            <li><span>Category</span><strong>{product.category}</strong></li>
          </ul>

          {product.available ? (
            <>
              <div className="details-buy">
                <div>
                  <label className="field-label">Quantity</label>
                  <QuantitySelector value={qty} unit={product.unit} onChange={setQty} />
                </div>
                <div className="details-total">
                  <span>Total</span>
                  <strong>{formatINR(round2(product.price * qty))}</strong>
                </div>
              </div>
              <div className="details-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={add}>
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button type="button" className="btn btn-orange btn-lg" onClick={buyNow}>
                  <Zap size={18} /> Buy Now
                </button>
              </div>
            </>
          ) : (
            <div className="soldout-note">
              This fruit is currently out of stock. Please check back soon or explore other fresh fruits.
            </div>
          )}

          <ul className="details-perks">
            <li><Leaf size={16} /> Farm fresh quality</li>
            <li><Truck size={16} /> Home delivery</li>
            <li><ShieldCheck size={16} /> Quality checked</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-inner">
          <h2 className="h2">You may also like</h2>
          <FruitGrid products={related} />
        </section>
      )}
    </div>
  );
}
