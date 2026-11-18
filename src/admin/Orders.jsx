import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, Trash2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../data/config';
import { formatDateTime, formatINR, fullAddress } from '../services/helpers';

export default function Orders() {
  const { orders, updateOrder, deleteOrder } = useStore();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const list = useMemo(() => {
    const t = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== 'All' && o.status !== status) return false;
      if (!t) return true;
      return `${o.id} ${o.customer.name} ${o.customer.mobile}`.toLowerCase().includes(t);
    });
  }, [orders, search, status]);

  const counts = useMemo(() => {
    const c = { All: orders.length };
    ORDER_STATUSES.forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <label className="search-form">
          <Search size={18} />
          <input type="search" placeholder="Search by order ID, name or mobile" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
        </label>
      </div>

      <div className="chip-row">
        {['All', ...ORDER_STATUSES].map((s) => (
          <button type="button" key={s} className={`chip ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
            {s} <span className="chip-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Orders placed by customers in this browser will appear here." />
      ) : list.length === 0 ? (
        <EmptyState title="No matching orders" message="Try a different search or status filter." />
      ) : (
        <div className="admin-orders">
          {list.map((o) => {
            const isOpen = open === o.id;
            return (
              <div className="admin-order" key={o.id}>
                <button type="button" className="admin-order-head" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen}>
                  <span className="oc-col"><small>Order ID</small><strong>{o.id}</strong></span>
                  <span className="oc-col"><small>Date &amp; time</small><strong>{formatDateTime(o.createdAt)}</strong></span>
                  <span className="oc-col"><small>Customer</small><strong>{o.customer.name}</strong><em>{o.customer.mobile}</em></span>
                  <span className="oc-col"><small>Total</small><strong>{formatINR(o.total)}</strong></span>
                  <span className="oc-col oc-status"><StatusBadge status={o.status} /><StatusBadge status={o.payment.status} /></span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isOpen && (
                  <div className="admin-order-body">
                    <div className="order-detail-grid">
                      <div>
                        <h4>Customer &amp; delivery</h4>
                        <p className="strong-line">{o.customer.name}</p>
                        <p className="muted-line">Mobile: {o.customer.mobile}</p>
                        <p className="muted-line">{fullAddress(o.address)}</p>
                        <h4>Payment</h4>
                        <p className="muted-line">
                          {PAYMENT_METHODS[o.payment.method]}{o.payment.channel ? ` (${o.payment.channel})` : ''}
                        </p>
                        {o.payment.method === 'ONLINE' && <p className="hint">Demo online payment - no real transaction took place.</p>}
                      </div>
                      <div>
                        <h4>Update order</h4>
                        <div className="field">
                          <label htmlFor={`os-${o.id}`}>Order status</label>
                          <select id={`os-${o.id}`} value={o.status} onChange={(e) => { updateOrder(o.id, { status: e.target.value }); toast.success(`Order ${o.id}: ${e.target.value}`); }}>
                            {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label htmlFor={`ps-${o.id}`}>Payment status</label>
                          <select id={`ps-${o.id}`} value={o.payment.status} onChange={(e) => { updateOrder(o.id, { paymentStatus: e.target.value }); toast.success(`Payment: ${e.target.value}`); }}>
                            {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <button type="button" className="btn btn-ghost-danger btn-sm" onClick={() => setConfirm(o)}><Trash2 size={14} /> Delete order</button>
                      </div>
                    </div>

                    <div className="table-card inner">
                      <table className="data-table">
                        <thead><tr><th>Fruit</th><th className="right">Qty</th><th className="right">Price</th><th className="right">Amount</th></tr></thead>
                        <tbody>
                          {o.items.map((l) => (
                            <tr key={l.productId}>
                              <td data-label="Fruit">{l.name}</td>
                              <td data-label="Qty" className="right">{l.qty} {l.unit}</td>
                              <td data-label="Price" className="right">{formatINR(l.price)}/{l.unit}</td>
                              <td data-label="Amount" className="right">{formatINR(l.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr><td colSpan={3} className="right">Subtotal</td><td className="right">{formatINR(o.subtotal)}</td></tr>
                          <tr><td colSpan={3} className="right">Delivery</td><td className="right">{o.deliveryCharge === 0 ? 'FREE' : formatINR(o.deliveryCharge)}</td></tr>
                          <tr className="grand"><td colSpan={3} className="right">Total</td><td className="right">{formatINR(o.total)}</td></tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal modal-sm">
            <div className="modal-body">
              <h3>Delete order {confirm.id}?</h3>
              <p className="muted-line">This permanently removes the order from this browser&apos;s demo storage.</p>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={() => setConfirm(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => { deleteOrder(confirm.id); setOpen(null); toast.success('Order deleted'); setConfirm(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
