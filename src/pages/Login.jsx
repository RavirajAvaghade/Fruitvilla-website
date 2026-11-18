import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateMobile } from '../services/helpers';

// DEMO customer login: no password, just name + mobile saved in this browser.
export default function Login() {
  const { customer, saveCustomer, customerLogout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(customer?.name || '');
  const [mobile, setMobile] = useState(customer?.mobile || '');
  const [errors, setErrors] = useState({});

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (name.trim().length < 2) err.name = 'Enter your name.';
    if (!validateMobile(mobile)) err.mobile = 'Enter a valid 10-digit mobile number.';
    setErrors(err);
    if (Object.keys(err).length) return;
    saveCustomer({ name: name.trim(), mobile });
    toast.success(`Welcome, ${name.trim().split(' ')[0]}!`);
    navigate('/my-orders');
  }

  return (
    <div className="container page">
      <div className="auth-card">
        <div className="auth-icon"><User size={28} /></div>
        <h1>{customer ? 'Your account' : 'Login / Sign up'}</h1>
        <p className="muted-line">Save your details to speed up checkout and see your orders.</p>

        <form onSubmit={submit} noValidate>
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="l-name">Full name</label>
            <input id="l-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className={`field ${errors.mobile ? 'has-error' : ''}`}>
            <label htmlFor="l-mobile">Mobile number</label>
            <input
              id="l-mobile" value={mobile} inputMode="numeric" maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} autoComplete="tel-national"
            />
            {errors.mobile && <span className="field-error">{errors.mobile}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block">{customer ? 'Update details' : 'Continue'}</button>
        </form>

        {customer && (
          <button type="button" className="btn btn-outline btn-block" onClick={() => { customerLogout(); toast.info('Logged out'); navigate('/'); }}>
            Logout
          </button>
        )}

        <div className="alert alert-info">
          <Info size={16} />
          <span>Demo only: there is no password or OTP. Your details are kept in this browser&apos;s localStorage.</span>
        </div>
        <p className="hint center"><Link to="/admin/login">Admin? Go to admin login</Link></p>
      </div>
    </div>
  );
}
