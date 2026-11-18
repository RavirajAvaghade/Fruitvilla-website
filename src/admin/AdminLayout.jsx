import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Apple, ClipboardList, Users, LogOut, Menu, X, Store, Info } from 'lucide-react';
import Logo from '../components/Logo';
import StorageNotice from '../components/StorageNotice';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/fruits', label: 'Manage Fruits', icon: Apple },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout() {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  function logout() {
    adminLogout();
    navigate('/admin/login', { replace: true });
  }

  const current = LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to)));

  return (
    <div className="admin-shell">
      <div className={`admin-backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-head">
          <Logo light to="/admin" />
          <button type="button" className="icon-btn admin-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav>
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link to="/" className="admin-link"><Store size={19} /> View store</Link>
          <button type="button" className="admin-link" onClick={logout}><LogOut size={19} /> Logout</button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <button type="button" className="icon-btn admin-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <h2>{current ? current.label : 'Admin'}</h2>
          <button type="button" className="btn btn-outline btn-sm" onClick={logout}><LogOut size={15} /> Logout</button>
        </header>
        <StorageNotice />
        <div className="admin-demo-banner">
          <Info size={15} />
          Demo data is stored in this browser only (localStorage). It does not sync with customers on other devices.
        </div>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
