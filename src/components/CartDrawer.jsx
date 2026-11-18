import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Trash2, X, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import FruitImage from './FruitImage';
import QuantitySelector from './QuantitySelector';
import { formatINR, unitLabel } from '../services/helpers';
import { DELIVERY } from '../data/config';

export default function CartDrawer() {
  const { items, totals, drawerOpen, closeDrawer, setQty, removeItem } = useCart();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', drawerOpen);
    function onKey(e) {
      if (e.key === 'Escape') closeDrawer();
    }
    if (drawerOpen) window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  const remaining = Math.max(0, DELIVERY.freeAbove - totals.subtotal);

  return (
    <>
      <div className={`drawer-backdrop ${drawerOpen ? 'open' : ''}`} onClick={closeDrawer} />
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen} aria-label="Shopping cart">
        <div className="drawer-head">
          <h3><ShoppingBag size={20} /> Your Cart <span>({items.length})</span></h3>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Close cart"><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <div className="state-icon"><ShoppingBag size={34} /></div>
            <h4>Your cart is empty</h4>
            <p>Add some fresh fruits to get started.</p>
            <Link to="/fruits" className="btn btn-primary" onClick={closeDrawer}>Shop fruits</Link>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {totals.subtotal > 0 && remaining > 0 && (
                <div className="free-ship-note">Add {formatINR(remaining)} more for <strong>free delivery</strong></div>
              )}
              {totals.subtotal >= DELIVERY.freeAbove && <div className="free-ship-note ok">You get <strong>free delivery</strong>!</div>}
              {items.map(({ product, qty, lineTotal, unavailable }) => (
                <div className={`drawer-item ${unavailable ? 'is-unavailable' : ''}`} key={product.id}>
                  <div className="drawer-item-img"><FruitImage product={product} /></div>
                  <div className="drawer-item-info">
                    <strong>{product.name}</strong>
                    <small>{formatINR(product.price)}{unitLabel(product.unit)}</small>
                    {unavailable ? (
                      <span className="inline-warn"><AlertCircle size={13} /> Out of stock</span>
                    ) : (
                      <QuantitySelector size="sm" value={qty} unit={product.unit} onChange={(v) => setQty(product.id, v)} />
                    )}
                  </div>
                  <div className="drawer-item-end">
                    <strong>{unavailable ? '-' : formatINR(lineTotal)}</strong>
                    <button type="button" className="icon-btn danger" onClick={() => removeItem(product.id)} aria-label={`Remove ${product.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="row"><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
              <div className="row muted"><span>Delivery</span><span>{totals.deliveryCharge === 0 ? 'FREE' : formatINR(totals.deliveryCharge)}</span></div>
              <div className="row total"><span>Total</span><strong>{formatINR(totals.total)}</strong></div>
              <div className="drawer-actions">
                <Link to="/cart" className="btn btn-outline" onClick={closeDrawer}>View cart</Link>
                {totals.payableCount > 0 && !totals.hasUnavailable ? (
                  <Link to="/checkout" className="btn btn-primary" onClick={closeDrawer}>Checkout</Link>
                ) : (
                  <Link to="/cart" className="btn btn-primary" onClick={closeDrawer}>Review cart</Link>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
