import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { admin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to="/admin" replace />;

  function submit(e) {
    e.preventDefault();
    const res = adminLogin(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const target = location.state?.from && location.state.from.startsWith('/admin') ? location.state.from : '/admin';
    navigate(target, { replace: true });
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <Logo />
        <h1>Admin Login</h1>
        <p className="muted-line">Sign in to manage fruits, prices and orders.</p>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="a-user">Username</label>
            <input id="a-user" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} autoComplete="username" autoFocus />
          </div>
          <div className="field">
            <label htmlFor="a-pass">Password</label>
            <div className="password-wrap">
              <input
                id="a-pass" type={show ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="current-password"
              />
              <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary btn-lg btn-block"><Lock size={16} /> Sign in</button>
        </form>

        <div className="alert alert-warn demo-creds">
          <ShieldAlert size={18} />
          <div>
            <strong>Demo credentials</strong>
            <p>Username: <code>admin</code> &middot; Password: <code>admin123</code></p>
            <p>These are NOT secure and must never be used in production. Real admin login needs a backend.</p>
          </div>
        </div>
        <p className="hint center"><Link to="/">&larr; Back to store</Link></p>
      </div>
    </div>
  );
}
