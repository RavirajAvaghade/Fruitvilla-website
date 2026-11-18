import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, CreditCard, Package, Info } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import StatusBadge from '../components/StatusBadge';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { PAYMENT_METHODS } from '../data/config';
import { formatDateTime, formatINR, fullAddress, unitLabel } from '../services/helpers';

export default function OrderSuccess() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container page">
        <EmptyState title="Order not found" message="We could not find this order in this browser." actionLabel="Go to My Orders" actionTo="/my-orders" />
      </div>
    );
  }

  const online = order.payment.method === 'ONLINE';

  return (
    <div className="container page narrow">
      <div className="success-hero">
        <div className="success-check"><CheckCircle2 size={44} /></div>
        <h1>Order placed successfully!</h1>
        <p>Thank you, {order.customer.name}. We have received your order and will confirm it shortly.</p>
        <div className="order-id-box">
          <span>Order ID</span>
          <strong>{order.id}</strong>
        </div>
      </div>

      {online && (
        <div className="alert alert-info">
          <Info size={18} />
          <span>
            <b>Demo online payment:</b> no real payment was made. Payment status is <b>{order.payment.status}</b>. A real
            payment gateway is needed to accept online payments.
          </span>
        </div>
      )}

      <div className="card">
        <h3 className="card-title"><Package size={18} /> Ordered items</h3>
        <ul className="order-lines">
          {order.items.map((l) => (
            <li key={l.productId}>
              <span className="summary-img"><FruitImage product={{ imageKey: l.imageKey, image: l.image, name: l.name }} /></span>
              <span className="summary-name">
                {l.name}
                <small>{l.qty} {l.unit === 'kg' ? 'kg' : l.unit} &times; {formatINR(l.price)}{unitLabel(l.unit)}</small>
              </span>
              <strong>{formatINR(l.lineTotal)}</strong>
            </li>
          ))}
        </ul>
        <div className="totals-block">
          <div className="row"><span>Subtotal</span><strong>{formatINR(order.subtotal)}</strong></div>
          <div className="row"><span>Delivery</span><strong>{order.deliveryCharge === 0 ? 'FREE' : formatINR(order.deliveryCharge)}</strong></div>
          <div className="row total"><span>Total amount</span><strong>{formatINR(order.total)}</strong></div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <h3 className="card-title"><MapPin size={18} /> Delivery address</h3>
          <p className="strong-line">{order.customer.name} &middot; {order.customer.mobile}</p>
          <p className="muted-line">{fullAddress(order.address)}</p>
        </div>
        <div className="card">
          <h3 className="card-title"><CreditCard size={18} /> Payment &amp; status</h3>
          <p className="strong-line">{PAYMENT_METHODS[order.payment.method]}</p>
          <p className="muted-line">Payment status: {order.payment.status}</p>
          <p className="muted-line">Placed on {formatDateTime(order.createdAt)}</p>
          <p><StatusBadge status={order.status} /></p>
        </div>
      </div>

      <div className="center-actions">
        <Link to="/my-orders" className="btn btn-outline btn-lg">View my orders</Link>
        <Link to="/fruits" className="btn btn-primary btn-lg">Continue shopping</Link>
      </div>
    </div>
  );
}
