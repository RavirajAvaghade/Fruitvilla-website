import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { PAYMENT_METHODS } from '../data/config';
import { formatDateTime, formatINR, fullAddress, validateMobile } from '../services/helpers';

export default function MyOrders() {
  const { orders } = useStore();
  const { customer } = useAuth();
  const [lookup, setLookup] = useState('');
  const [lookupMobile, setLookupMobile] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [open, setOpen] = useState(null);

  const mobile = customer?.mobile || lookupMobile;
  const mine = mobile ? orders.filter((o) => o.customer?.mobile === mobile) : [];

  function submitLookup(e) {
    e.preventDefault();
    if (!validateMobile(lookup)) {
      setLookupError('Enter the 10-digit mobile number used while ordering.');
      return;
    }
    setLookupError('');
    setLookupMobile(lookup);
  }

  return (
    <div className="container page narrow">
      <div className="page-head">
        <div>
          <h1>My Orders</h1>
          <p>{mobile ? `Orders for ${mobile}` : 'Find your orders with your mobile number'}</p>
        </div>
      </div>

      {!mobile && (
        <form className="card lookup-card" onSubmit={submitLookup} noValidate>
          <h3 className="card-title"><Search size={18} /> Track your orders</h3>
          <p className="muted-line">You are not logged in. Enter the mobile number you used at checkout. (Demo: orders are stored in this browser only.)</p>
          <div className="lookup-row">
            <input
              value={lookup} inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
              onChange={(e) => setLookup(e.target.value.replace(/\D/g, ''))} aria-label="Mobile number"
            />
            <button type="submit" className="btn btn-primary">Find orders</button>
          </div>
          {lookupError && <span className="field-error">{lookupError}</span>}
          <p className="hint">Or <Link to="/login">log in</Link> to see your orders automatically.</p>
        </form>
      )}

      {mobile && mine.length === 0 && (
        <EmptyState
          title="No orders yet"
          message="You have not placed any orders with this mobile number in this browser."
          actionLabel="Start shopping"
          actionTo="/fruits"
        />
      )}

      <div className="orders-list">
        {mine.map((o) => {
          const isOpen = open === o.id;
          return (
            <div className="order-card" key={o.id}>
              <button type="button" className="order-card-head" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen}>
                <span className="oc-col">
                  <small>Order ID</small>
                  <strong>{o.id}</strong>
                </span>
                <span className="oc-col">
                  <small>Date</small>
                  <strong>{formatDateTime(o.createdAt)}</strong>
                </span>
                <span className="oc-col">
                  <small>Amount</small>
                  <strong>{formatINR(o.total)}</strong>
                </span>
                <span className="oc-col oc-status">
                  <StatusBadge status={o.status} />
                </span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="order-card-body">
                  <ul className="order-lines compact">
                    {o.items.map((l) => (
                      <li key={l.productId}>
                        <span className="summary-name">{l.name}<small>{l.qty} {l.unit} &times; {formatINR(l.price)}</small></span>
                        <strong>{formatINR(l.lineTotal)}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="muted-line"><b>Delivery:</b> {fullAddress(o.address)}</p>
                  <p className="muted-line"><b>Payment:</b> {PAYMENT_METHODS[o.payment.method]} &middot; {o.payment.status}</p>
                  <Link to={`/order-success/${o.id}`} className="link-arrow">View order confirmation</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
