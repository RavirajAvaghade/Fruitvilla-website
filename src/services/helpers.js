import { DELIVERY, SERVICEABLE_PINCODES } from '../data/config';

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export function formatINR(value) {
  const n = Number(value) || 0;
  const hasFraction = Math.abs(n - Math.round(n)) > 0.001;
  return '₹' + n.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch (e) {
    return '-';
  }
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return '-';
  }
}

export function isSameDay(iso, ref = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

/** Quantity step: kg fruits can be bought in 0.5 kg steps, everything else in whole units. */
export function qtyStep(unit) {
  return unit === 'kg' ? 0.5 : 1;
}

export function formatQty(qty, unit) {
  const q = Number(qty) || 0;
  const label = unit === 'kg' ? 'kg' : unit === 'dozen' ? (q === 1 ? 'dozen' : 'dozen') : unit === 'box' ? (q === 1 ? 'box' : 'boxes') : q === 1 ? 'piece' : 'pieces';
  return `${q} ${label}`;
}

export function unitLabel(unit) {
  return `/${unit}`;
}

export function calcDelivery(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= DELIVERY.freeAbove ? 0 : DELIVERY.charge;
}

export function validateMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || '').trim());
}

export function validatePin(value) {
  return /^[1-9]\d{5}$/.test(String(value || '').trim());
}

export function isServiceablePin(value) {
  return SERVICEABLE_PINCODES.includes(String(value || '').trim());
}

export function generateOrderId(existingIds = []) {
  const d = new Date();
  const ymd =
    String(d.getFullYear()).slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  do {
    let suffix = '';
    for (let i = 0; i < 5; i += 1) suffix += chars[Math.floor(Math.random() * chars.length)];
    id = `FV${ymd}-${suffix}`;
  } while (existingIds.includes(id));
  return id;
}

export function fullAddress(a) {
  if (!a) return '';
  return [
    a.house, a.street, a.area, a.landmark ? `Near ${a.landmark}` : '',
    a.city, a.state, a.pin,
  ].filter(Boolean).join(', ');
}

export function discountPercent(product) {
  if (!product || !product.mrp || product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
}

export function statusClass(status) {
  return 'status-' + String(status || '').toLowerCase().replace(/[^a-z]+/g, '-');
}
