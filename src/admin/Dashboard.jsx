import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CalendarDays, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useStore } from '../context/StoreContext';
import { formatDateTime, formatINR, isSameDay } from '../services/helpers';

function StatCard({ icon: Icon, label, value, tone = 'green' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { orders, products } = useStore();

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== 'Cancelled');
    return {
      totalOrders: orders.length,
      today: orders.filter((o) => isSameDay(o.createdAt)).length,
      revenue: valid.reduce((s, o) => s + o.total, 0),
      available: products.filter((p) => p.available).length,
      out: products.filter((p) => !p.available).length,
    };
  }, [orders, products]);

  // Last 7 days revenue (cancelled orders excluded)
  const days = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const list = orders.filter((o) => o.status !== 'Cancelled' && isSameDay(o.createdAt, d));
      out.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: list.reduce((s, o) => s + o.total, 0),
        count: list.length,
      });
    }
    return out;
  }, [orders]);

  const max = Math.max(1, ...days.map((d) => d.revenue));
  const weekTotal = days.reduce((s, d) => s + d.revenue, 0);
  const recent = orders.slice(0, 6);

  return (
    <div className="admin-page">
      <div className="stat-grid">
        <StatCard icon={ClipboardList} label="Total Orders" value={stats.totalOrders} tone="green" />
        <StatCard icon={CalendarDays} label="Today's Orders" value={stats.today} tone="blue" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatINR(stats.revenue)} tone="orange" />
        <StatCard icon={CheckCircle2} label="Available Fruits" value={stats.available} tone="green" />
        <StatCard icon={XCircle} label="Out of Stock" value={stats.out} tone="red" />
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head">
            <h3 className="card-title">Sales overview</h3>
            <span className="muted-line">Last 7 days &middot; {formatINR(weekTotal)}</span>
          </div>
          <div className="bar-chart" role="img" aria-label="Revenue for the last 7 days">
            {days.map((d) => (
              <div className="bar-col" key={d.date} title={`${d.date}: ${formatINR(d.revenue)} (${d.count} orders)`}>
                <span className="bar-value">{d.revenue > 0 ? formatINR(d.revenue) : ''}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${Math.max(d.revenue > 0 ? 6 : 0, (d.revenue / max) * 100)}%` }} />
                </div>
                <span className="bar-label">{d.label}</span>
                <small>{d.date}</small>
              </div>
            ))}
          </div>
          {orders.length === 0 && <p className="muted-line center">No orders yet. Sales will appear here once customers order.</p>}
        </section>

        <section className="card">
          <div className="card-head">
            <h3 className="card-title">Recent orders</h3>
            <Link to="/admin/orders" className="link-arrow">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted-line">No orders yet.</p>
          ) : (
            <ul className="recent-list">
              {recent.map((o) => (
                <li key={o.id}>
                  <div>
                    <strong>{o.id}</strong>
                    <small>{o.customer.name} &middot; {formatDateTime(o.createdAt)}</small>
                  </div>
                  <div className="recent-end">
                    <strong>{formatINR(o.total)}</strong>
                    <StatusBadge status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
