import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, readJSON, writeJSON } from '../services/storage';
import { SEED_FRUITS } from '../data/seedFruits';
import { generateOrderId, round2 } from '../services/helpers';

// StoreContext holds the shared "database": products and orders (both persisted in localStorage).

const StoreContext = createContext(null);

function sanitizeProduct(p) {
  return {
    id: String(p.id),
    name: String(p.name || 'Unnamed fruit'),
    category: String(p.category || 'Orchard'),
    price: Math.max(0, Number(p.price) || 0),
    mrp: Math.max(0, Number(p.mrp) || 0),
    unit: String(p.unit || 'kg'),
    imageKey: p.imageKey ? String(p.imageKey) : '',
    image: p.image ? String(p.image) : '',
    description: String(p.description || ''),
    available: p.available !== false,
    featured: !!p.featured,
    seasonal: !!p.seasonal,
    bestSeller: !!p.bestSeller,
  };
}

function loadProducts() {
  const stored = readJSON(KEYS.products, null);
  if (Array.isArray(stored) && stored.length > 0) {
    return stored.filter((p) => p && p.id).map(sanitizeProduct);
  }
  if (Array.isArray(stored) && stored.length === 0) return [];
  return SEED_FRUITS.map(sanitizeProduct);
}

function loadOrders() {
  const stored = readJSON(KEYS.orders, []);
  return Array.isArray(stored) ? stored.filter((o) => o && o.id && Array.isArray(o.items)) : [];
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(loadProducts);
  const [orders, setOrders] = useState(loadOrders);
  const [saveError, setSaveError] = useState('');

  // Persist products
  useEffect(() => {
    const res = writeJSON(KEYS.products, products);
    setSaveError(res.ok ? '' : res.error);
  }, [products]);

  // Persist orders
  useEffect(() => {
    const res = writeJSON(KEYS.orders, orders);
    setSaveError(res.ok ? '' : res.error);
  }, [orders]);

  // Keep other open tabs of the same browser in sync (e.g. admin tab + shop tab).
  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEYS.products) setProducts(loadProducts());
      if (e.key === KEYS.orders) setOrders(loadOrders());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ---------- Products ---------- */
  const addProduct = useCallback((data) => {
    const product = sanitizeProduct({ ...data, id: `fruit-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}` });
    setProducts((list) => [product, ...list]);
    return product;
  }, []);

  const updateProduct = useCallback((id, data) => {
    setProducts((list) => list.map((p) => (p.id === id ? sanitizeProduct({ ...p, ...data, id }) : p)));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((list) => list.filter((p) => p.id !== id));
  }, []);

  const toggleAvailability = useCallback((id) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, available: !p.available } : p)));
  }, []);

  const resetProducts = useCallback(() => {
    setProducts(SEED_FRUITS.map(sanitizeProduct));
  }, []);

  const getProduct = useCallback((id) => products.find((p) => p.id === id) || null, [products]);

  /* ---------- Orders ---------- */
  const placeOrder = useCallback(
    ({ customer, address, items, paymentMethod, paymentChannel, deliveryCharge }) => {
      // Re-read latest products from storage to avoid stale prices, then snapshot them.
      const latest = readJSON(KEYS.products, null);
      const catalogue = Array.isArray(latest) && latest.length ? latest.map(sanitizeProduct) : products;
      const lines = [];
      for (const item of items) {
        const product = catalogue.find((p) => p.id === item.productId);
        if (!product) return { ok: false, error: 'A product in your cart no longer exists.' };
        if (!product.available) return { ok: false, error: `${product.name} is currently out of stock.` };
        lines.push({
          productId: product.id,
          name: product.name,
          unit: product.unit,
          imageKey: product.imageKey,
          image: product.image,
          price: product.price, // price snapshot - never changes later
          qty: item.qty,
          lineTotal: round2(product.price * item.qty),
        });
      }
      if (lines.length === 0) return { ok: false, error: 'Your cart is empty.' };

      const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
      const total = round2(subtotal + deliveryCharge);

      const existing = readJSON(KEYS.orders, []);
      const existingIds = (Array.isArray(existing) ? existing : []).map((o) => o.id);
      const order = {
        id: generateOrderId(existingIds),
        createdAt: new Date().toISOString(),
        customer,
        address,
        items: lines,
        subtotal,
        deliveryCharge,
        total,
        payment: {
          method: paymentMethod,
          channel: paymentChannel || null,
          // Online payment is a demo only: it is never auto-marked Paid.
          status: paymentMethod === 'COD' ? 'Pay on Delivery' : 'Pending',
        },
        status: 'New',
      };

      const merged = [order, ...(Array.isArray(existing) ? existing : [])];
      const res = writeJSON(KEYS.orders, merged);
      if (!res.ok) return { ok: false, error: res.error };
      setOrders(merged);
      return { ok: true, order };
    },
    [products]
  );

  const updateOrder = useCallback((id, patch) => {
    setOrders((list) =>
      list.map((o) => {
        if (o.id !== id) return o;
        const next = { ...o };
        if (patch.status) next.status = patch.status;
        if (patch.paymentStatus) next.payment = { ...o.payment, status: patch.paymentStatus };
        return next;
      })
    );
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders((list) => list.filter((o) => o.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      products, orders, saveError,
      addProduct, updateProduct, deleteProduct, toggleAvailability, resetProducts, getProduct,
      placeOrder, updateOrder, deleteOrder,
    }),
    [products, orders, saveError, addProduct, updateProduct, deleteProduct, toggleAvailability, resetProducts, getProduct, placeOrder, updateOrder, deleteOrder]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
