import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X, Package, LogOut, Phone } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../data/config';

export default function Navbar() {
  const { totals, openDrawer } = useCart();
  const { customer, customerLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState(params.get('q') || '');

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/fruits') setQuery(params.get('q') || '');
  }, [location.pathname, params]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', menuOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [menuOpen]);

  function submitSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/fruits?q=${encodeURIComponent(q)}` : '/fruits');
    setMenuOpen(false);
  }

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Free delivery on orders above ₹500</span>
          <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}><Phone size={13} /> {BRAND.phone}</a>
        </div>
      </div>

      <div className="navbar">
        <div className="container navbar-inner">
          <button type="button" className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          <Logo />

          <nav className="nav-links desktop-only" aria-label="Main">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/fruits" className={linkClass}>All Fruits</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          </nav>

          <form className="search-form desktop-search" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search fresh fruits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search fruits"
            />
          </form>

          <div className="nav-actions">
            <div className="account-wrap">
              <button
                type="button"
                className="icon-btn with-label"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-label="Account"
              >
                <User size={20} />
                <span className="desktop-only">{customer ? customer.name?.split(' ')[0] || 'Account' : 'Login'}</span>
              </button>
              {accountOpen && (
                <div className="account-menu">
                  {customer ? (
                    <>
                      <div className="account-menu-head">
                        <strong>{customer.name || 'Customer'}</strong>
                        <small>{customer.mobile}</small>
                      </div>
                      <Link to="/my-orders"><Package size={16} /> My Orders</Link>
                      <button type="button" onClick={() => { customerLogout(); setAccountOpen(false); navigate('/'); }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login"><User size={16} /> Login / Sign up</Link>
                      <Link to="/my-orders"><Package size={16} /> Track my orders</Link>
                    </>
                  )}
                  <Link to="/admin/login" className="account-admin-link">Admin Panel</Link>
                </div>
              )}
            </div>

            <button type="button" className="icon-btn cart-btn" onClick={openDrawer} aria-label={`Open cart, ${totals.itemCount} items`}>
              <ShoppingCart size={21} />
              {totals.itemCount > 0 && <span className="cart-count">{totals.itemCount}</span>}
              <span className="desktop-only">Cart</span>
            </button>
          </div>
        </div>

        <div className="container mobile-search">
          <form className="search-form" onSubmit={submitSearch} role="search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search fresh fruits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search fruits"
            />
          </form>
        </div>
      </div>

      {/* Mobile / tablet slide-in menu */}
      <div className={`mobile-menu-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-head">
          <Logo />
          <button type="button" className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>
        <nav className="mobile-menu-links">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/fruits" className={linkClass}>All Fruits</NavLink>
          <NavLink to="/my-orders" className={linkClass}>My Orders</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          {!customer && <NavLink to="/login" className={linkClass}>Login / Sign up</NavLink>}
          <NavLink to="/admin/login" className={linkClass}>Admin Panel</NavLink>
        </nav>
      </aside>
    </header>
  );
}
