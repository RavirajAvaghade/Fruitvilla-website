import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, CreditCard, Banknote, MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import FruitImage from '../components/FruitImage';
import { EmptyState } from '../components/StateViews';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { INDIAN_STATES, SERVICEABLE_PINCODES } from '../data/config';
import { formatINR, isServiceablePin, unitLabel, validateMobile, validatePin } from '../services/helpers';

const EMPTY = {
  name: '', mobile: '', house: '', street: '', area: '', landmark: '', city: 'Pune', state: 'Maharashtra', pin: '',
};

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { placeOrder } = useStore();
  const { customer, saveCustomer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(customer ? { name: customer.name || '', mobile: customer.mobile || '', ...(customer.address || {}) } : {}),
  }));
  const [errors, setErrors] = useState({});
  const [pinState, setPinState] = useState(null); // null | 'ok' | 'bad'
  const [method, setMethod] = useState('COD');
  const [channel, setChannel] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (form.pin.length === 6 && validatePin(form.pin)) setPinState(isServiceablePin(form.pin) ? 'ok' : 'bad');
    else setPinState(null);
  }, [form.pin]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!validateMobile(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number (starting 6-9).';
    if (!form.house.trim()) e.house = 'Enter your house / flat number.';
    if (!form.street.trim()) e.street = 'Enter your street.';
    if (!form.area.trim()) e.area = 'Enter your area.';
    if (!form.city.trim()) e.city = 'Enter your city.';
    if (!form.state.trim()) e.state = 'Select your state.';
    if (!validatePin(form.pin)) e.pin = 'Enter a valid 6-digit PIN code.';
    else if (!isServiceablePin(form.pin)) e.pin = 'Sorry, we do not deliver to this PIN code yet.';
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    setSubmitError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const first = document.querySelector('[data-error="true"]');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (totals.hasUnavailable || totals.payableCount === 0) {
      setSubmitError('Some items in your cart are out of stock. Please update your cart.');
      return;
    }

    setSubmitting(true);
    const customerInfo = { name: form.name.trim(), mobile: form.mobile.trim() };
    const address = {
      house: form.house.trim(), street: form.street.trim(), area: form.area.trim(),
      landmark: form.landmark.trim(), city: form.city.trim(), state: form.state.trim(), pin: form.pin.trim(),
    };
    const result = placeOrder({
      customer: customerInfo,
      address,
      items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
      paymentMethod: method,
      paymentChannel: method === 'ONLINE' ? channel : null,
      deliveryCharge: totals.deliveryCharge,
    });
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      toast.error(result.error);
      return;
    }
    saveCustomer({ ...customerInfo, address });
    clearCart();
    navigate(`/order-success/${result.order.id}`, { replace: true });
  }

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState title="Your cart is empty" message="Add some fruits before checking out." actionLabel="Shop fruits" actionTo="/fruits" />
      </div>
    );
  }

  const field = (name, label, props = {}) => (
    <div className={`field ${errors[name] ? 'has-error' : ''} ${props.wide ? 'wide' : ''}`} data-error={errors[name] ? 'true' : undefined}>
      <label htmlFor={`f-${name}`}>{label}{props.optional ? <small> (optional)</small> : null}</label>
      <input
        id={`f-${name}`}
        value={form[name]}
        onChange={(e) => set(name, props.digits ? e.target.value.replace(/\D/g, '').slice(0, props.max) : e.target.value)}
        inputMode={props.digits ? 'numeric' : undefined}
        autoComplete={props.autoComplete}
        placeholder={props.placeholder}
        maxLength={props.max}
      />
      {errors[name] && <span className="field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="container page">
      <div className="page-head">
        <div><h1>Checkout</h1><p>Enter your delivery details to place your order</p></div>
      </div>

      {totals.hasUnavailable && (
        <div className="alert alert-warn">
          <AlertCircle size={18} /> Some cart items are out of stock. <Link to="/cart">Update cart</Link>
        </div>
      )}

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-main">
          <section className="card">
            <h3 className="card-title"><MapPin size={18} /> Delivery details</h3>
            <div className="form-grid">
              {field('name', 'Full name', { autoComplete: 'name', placeholder: 'e.g. Ravi Sharma', wide: true })}
              {field('mobile', 'Mobile number', { digits: true, max: 10, autoComplete: 'tel-national', placeholder: '10-digit mobile' })}
              {field('house', 'House / Flat no.', { autoComplete: 'address-line1', placeholder: 'e.g. B-204' })}
              {field('street', 'Street', { autoComplete: 'address-line2', placeholder: 'Street / society name' })}
              {field('area', 'Area', { placeholder: 'e.g. Kothrud' })}
              {field('landmark', 'Landmark', { optional: true, placeholder: 'Near...' })}
              {field('city', 'City', { autoComplete: 'address-level2' })}
              <div className={`field ${errors.state ? 'has-error' : ''}`} data-error={errors.state ? 'true' : undefined}>
                <label htmlFor="f-state">State</label>
                <select id="f-state" value={form.state} onChange={(e) => set('state', e.target.value)}>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
              <div className={`field ${errors.pin ? 'has-error' : ''}`} data-error={errors.pin ? 'true' : undefined}>
                <label htmlFor="f-pin">PIN code</label>
                <input
                  id="f-pin" value={form.pin} inputMode="numeric" maxLength={6} placeholder="6-digit PIN"
                  autoComplete="postal-code"
                  onChange={(e) => set('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                {errors.pin && <span className="field-error">{errors.pin}</span>}
                {!errors.pin && pinState === 'ok' && <span className="field-ok"><CheckCircle2 size={14} /> Delivery available in your area</span>}
                {!errors.pin && pinState === 'bad' && <span className="field-error"><AlertCircle size={14} /> We do not deliver to this PIN code yet</span>}
              </div>
            </div>
            <p className="hint">
              Demo delivery PIN codes: {SERVICEABLE_PINCODES.slice(0, 6).join(', ')}&hellip; (editable in <code>src/data/config.js</code>)
            </p>
          </section>

          <section className="card">
            <h3 className="card-title"><CreditCard size={18} /> Payment method</h3>
            <div className="pay-options">
              <label className={`pay-option ${method === 'COD' ? 'selected' : ''}`}>
                <input type="radio" name="pay" checked={method === 'COD'} onChange={() => setMethod('COD')} />
                <Banknote size={22} />
                <span><strong>Cash on Delivery</strong><small>Pay when your fruits arrive</small></span>
              </label>
              <label className={`pay-option ${method === 'ONLINE' ? 'selected' : ''}`}>
                <input type="radio" name="pay" checked={method === 'ONLINE'} onChange={() => setMethod('ONLINE')} />
                <CreditCard size={22} />
                <span><strong>Online Payment</strong><small>Demo interface only</small></span>
              </label>
            </div>

            {method === 'ONLINE' && (
              <div className="demo-pay">
                <div className="demo-pay-warn">
                  <ShieldAlert size={20} />
                  <div>
                    <strong>Demo mode &mdash; no real payment</strong>
                    <p>
                      This store is not connected to a payment gateway. No money will be charged and no card or UPI
                      details are collected. Your order will be saved with payment status <b>Pending</b>.
                    </p>
                  </div>
                </div>
                <div className="channel-row" role="radiogroup" aria-label="Preferred online payment channel (demo)">
                  {['UPI', 'Card', 'Net Banking'].map((c) => (
                    <button
                      type="button" key={c} role="radio" aria-checked={channel === c}
                      className={`chip ${channel === c ? 'active' : ''}`} onClick={() => setChannel(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          <ul className="summary-items">
            {items.map(({ product, qty, lineTotal, unavailable }) => (
              <li key={product.id} className={unavailable ? 'is-unavailable' : ''}>
                <span className="summary-img"><FruitImage product={product} /></span>
                <span className="summary-name">
                  {product.name}
                  <small>{qty} {product.unit === 'kg' ? 'kg' : product.unit} &times; {formatINR(product.price)}{unitLabel(product.unit)}</small>
                </span>
                <strong>{unavailable ? 'Out of stock' : formatINR(lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <div className="row"><span>Subtotal</span><strong>{formatINR(totals.subtotal)}</strong></div>
          <div className="row"><span>Delivery</span><strong>{totals.deliveryCharge === 0 ? 'FREE' : formatINR(totals.deliveryCharge)}</strong></div>
          <div className="row total"><span>Grand Total</span><strong>{formatINR(totals.total)}</strong></div>
          {submitError && <div className="alert alert-error"><AlertCircle size={16} /> {submitError}</div>}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting || totals.hasUnavailable}>
            {submitting ? <><Loader2 size={18} className="spin" /> Placing order...</> : method === 'COD' ? 'Place Order (Cash on Delivery)' : 'Place Order (Demo Payment)'}
          </button>
          <Link to="/cart" className="btn btn-outline btn-block">Back to cart</Link>
        </aside>
      </form>
    </div>
  );
}
