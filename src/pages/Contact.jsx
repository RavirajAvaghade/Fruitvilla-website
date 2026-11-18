import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Clock, CheckCircle2 } from 'lucide-react';
import { BRAND } from '../data/config';
import { validateMobile } from '../services/helpers';

export default function Contact() {
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  }

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (form.name.trim().length < 2) err.name = 'Please enter your name.';
    if (!validateMobile(form.mobile)) err.mobile = 'Enter a valid 10-digit mobile number.';
    if (form.message.trim().length < 5) err.message = 'Please write a short message.';
    setErrors(err);
    if (Object.keys(err).length) return;
    // Demo: there is no backend, so the message is not actually transmitted anywhere.
    setSent(true);
    setForm({ name: '', mobile: '', message: '' });
  }

  return (
    <div className="container page">
      <div className="page-head"><div><h1>Contact us</h1><p>We would love to hear from you</p></div></div>
      <div className="contact-layout">
        <div className="card contact-info">
          <h3 className="card-title">Get in touch</h3>
          <ul>
            <li><Phone size={18} /> <span><b>Phone</b><br /><a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a></span></li>
            <li><Mail size={18} /> <span><b>Email</b><br />{BRAND.email}</span></li>
            <li><MapPin size={18} /> <span><b>Address</b><br />{BRAND.address}</span></li>
            <li><Clock size={18} /> <span><b>Delivery hours</b><br />7:00 AM - 9:00 PM, every day</span></li>
          </ul>
        </div>

        <form className="card" onSubmit={submit} noValidate>
          <h3 className="card-title">Send a message</h3>
          {sent && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>Thanks! In this demo the message is not sent anywhere - a backend is needed to receive messages. Please call us for urgent help.</span>
            </div>
          )}
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="c-name">Your name</label>
            <input id="c-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className={`field ${errors.mobile ? 'has-error' : ''}`}>
            <label htmlFor="c-mobile">Mobile number</label>
            <input id="c-mobile" value={form.mobile} inputMode="numeric" maxLength={10} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} />
            {errors.mobile && <span className="field-error">{errors.mobile}</span>}
          </div>
          <div className={`field ${errors.message ? 'has-error' : ''}`}>
            <label htmlFor="c-msg">Message</label>
            <textarea id="c-msg" rows={5} value={form.message} onChange={(e) => set('message', e.target.value)} />
            {errors.message && <span className="field-error">{errors.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg"><Send size={16} /> Send message</button>
        </form>
      </div>
    </div>
  );
}
