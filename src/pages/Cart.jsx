import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import QuantitySelector from '../components/QuantitySelector';
import { EmptyState } from '../components/StateViews';
import { useCart } from '../context/CartContext';
import { DELIVERY } from '../data/config';
import { formatINR, unitLabel } from '../services/helpers';

export default function Cart() {
  const { items, totals, setQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added any fruits yet."
          actionLabel="Start shopping"
          actionTo="/fruits"
        />
      </div>
    );
  }

  const canCheckout = totals.payableCount > 0 && !totals.hasUnavailable;
  const remaining = Math.max(0, DELIVERY.freeAbove - totals.subtotal);

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>Shopping Cart</h1>
          <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button type="button" className="btn btn-ghost-danger" onClick={clearCart}><Trash2 size={16} /> Clear cart</button>
      </div>

      {totals.hasUnavailable && (
        <div className="alert alert-warn">
          <AlertCircle size={18} />
          Some items are out of stock. Please remove them to continue to checkout.
        </div>
      )}

      <div className="cart-layout">
        <div className="cart-list">
          {items.map(({ product, qty, lineTotal, unavailable }) => (
            <div className={`cart-row ${unavailable ? 'is-unavailable' : ''}`} key={product.id}>
              <Link to={`/fruits/${product.id}`} className="cart-row-img"><FruitImage product={product} /></Link>
              <div className="cart-row-info">
                <Link to={`/fruits/${product.id}`}><strong>{product.name}</strong></Link>
                <small>{product.category}</small>
                <span className="cart-unit-price">{formatINR(product.price)}{unitLabel(product.unit)}</span>
                {unavailable && <span className="inline-warn"><AlertCircle size={13} /> Out of stock</span>}
              </div>
              <div className="cart-row-qty">
                {!unavailable && <QuantitySelector value={qty} unit={product.unit} onChange={(v) => setQty(product.id, v)} />}
              </div>
              <div className="cart-row-total">
                <strong>{unavailable ? '-' : formatINR(lineTotal)}</strong>
              </div>
              <button type="button" className="icon-btn danger" onClick={() => removeItem(product.id)} aria-label={`Remove ${product.name}`}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <Link to="/fruits" className="back-link"><ArrowLeft size={16} /> Continue shopping</Link>
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          <div className="row"><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
          <div className="row"><span>Delivery charges</span><strong>{totals.deliveryCharge === 0 ? 'FREE' : formatINR(totals.deliveryCharge)}</strong></div>
          {remaining > 0 && totals.subtotal > 0 && (
            <div className="free-ship-note">Add {formatINR(remaining)} more for free delivery</div>
          )}
          <div className="row total"><span>Grand Total</span><strong>{formatINR(totals.total)}</strong></div>
          <button type="button" className="btn btn-primary btn-lg btn-block" disabled={!canCheckout} onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/fruits" className="btn btn-outline btn-block">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}
