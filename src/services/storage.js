// Safe localStorage helpers. Every call is wrapped so a blocked/full/corrupt storage never crashes the app.

export const KEYS = {
  products: 'fruivilla:products:v1',
  cart: 'fruivilla:cart:v1',
  orders: 'fruivilla:orders:v1',
  customer: 'fruivilla:customer:v1',
  adminSession: 'fruivilla:admin-session:v1',
};

let lastError = null;

export function getStorageError() {
  return lastError;
}

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (err) {
    lastError = `Could not read "${key}" from browser storage.`;
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    lastError = null;
    return { ok: true };
  } catch (err) {
    const quota = err && (err.name === 'QuotaExceededError' || err.code === 22);
    lastError = quota
      ? 'Browser storage is full. Try using smaller product images.'
      : 'Could not save to browser storage (it may be blocked or in private mode).';
    return { ok: false, error: lastError };
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    lastError = `Could not remove "${key}" from browser storage.`;
  }
}
