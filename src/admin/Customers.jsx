import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { EmptyState } from '../components/StateViews';
import { useStore } from '../context/StoreContext';
import { formatDateTime, formatINR, fullAddress } from '../services/helpers';

export default function Customers() {
  const { orders } = useStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(null);

  // Customers are derived from orders and grouped by mobile number.
  const customers = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const key = o.customer.mobile;
      if (!map.has(key)) {
        map.set(key, { mobile: key, name: o.customer.name, address: o.address, orders: [], total: 0, last: o.createdAt });
      }
      const c = map.get(key);
      c.orders.push(o);
      if (o.status !== 'Cancelled') c.total += o.total;
      if (new Date(o.createdAt) > new Date(c.last)) {
        c.last = o.createdAt;
        c.name = o.customer.name;
        c.address = o.address;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [orders]);

  const list = useMemo(() => {
    const t = search.trim().toLowerCase();
    return t ? customers.filter((c) => `${c.name} ${c.mobile}`.toLowerCase().includes(t)) : customers;
  }, [customers, search]);

  return (
    <div className="admin-page">
      <div className="admin-toolbar">
        <label className="search-form">
          <Search size={18} />
          <input type="search" placeholder="Search by name or mobile" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" />
        </label>
        <span className="muted-line">{customers.length} customers</span>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" message="Customers appear here after they place an order." />
      ) : list.length === 0 ? (
        <EmptyState title="No matching customers" message="Try a different search." />
      ) : (
        <div className="admin-orders">
          {list.map((c) => {
            const isOpen = open === c.mobile;
            return (
              <div className="admin-order" key={c.mobile}>
                <button type="button" className="admin-order-head" onClick={() => setOpen(isOpen ? null : c.mobile)} aria-expanded={isOpen}>
                  <span className="oc-col"><small>Customer</small><strong>{c.name}</strong></span>
                  <span className="oc-col"><small>Mobile</small><strong>{c.mobile}</strong></span>
                  <span className="oc-col"><small>Orders</small><strong>{c.orders.length}</strong></span>
                  <span className="oc-col"><small>Total purchases</small><strong>{formatINR(c.total)}</strong></span>
                  <span className="oc-col"><small>Last order</small><strong>{formatDateTime(c.last)}</strong></span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="admin-order-body">
                    <p className="muted-line"><b>Latest address:</b> {fullAddress(c.address)}</p>
                    <div className="table-card inner">
                      <table className="data-table">
                        <thead><tr><th>Order ID</th><th>Date</th><th className="right">Amount</th><th>Status</th></tr></thead>
                        <tbody>
                          {c.orders.map((o) => (
                            <tr key={o.id}>
                              <td data-label="Order ID"><strong>{o.id}</strong></td>
                              <td data-label="Date">{formatDateTime(o.createdAt)}</td>
                              <td data-label="Amount" className="right">{formatINR(o.total)}</td>
                              <td data-label="Status"><StatusBadge status={o.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="hint">Total purchases exclude cancelled orders.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
