import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, readJSON, writeJSON } from '../services/storage';
import { useStore } from './StoreContext';
import { calcDelivery, qtyStep, round2 } from '../services/helpers';

// The cart stores only { productId, qty }. Prices are always read from the CURRENT product list,
// so the cart reflects admin price changes immediately. Prices are snapshotted when an order is placed.

const CartContext = createContext(null);
const MAX_QTY = 50;

function loadCart() {
  const stored = readJSON(KEYS.cart, []);
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((i) => i && i.productId && Number(i.qty) > 0)
    .map((i) => ({ productId: String(i.productId), qty: Number(i.qty) }));
}

export function CartProvider({ children }) {
  const { products } = useStore();
  const [raw, setRaw] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    writeJSON(KEYS.cart, raw);
  }, [raw]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEYS.cart) setRaw(loadCart());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Resolve cart lines against the current catalogue.
  const items = useMemo(() => {
    const out = [];
    for (const line of raw) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue; // deleted product - silently dropped
      out.push({
        product,
        qty: line.qty,
        lineTotal: round2(product.price * line.qty),
        unavailable: !product.available,
      });
    }
    return out;
  }, [raw, products]);

  // Remove lines whose product was deleted by admin.
  useEffect(() => {
    const ids = new Set(products.map((p) => p.id));
    setRaw((list) => {
      const filtered = list.filter((l) => ids.has(l.productId));
      return filtered.length === list.length ? list : filtered;
    });
  }, [products]);

  const addToCart = useCallback(
    (product, qty) => {
      if (!product || !product.available) return { ok: false, error: 'This fruit is out of stock.' };
      const step = qtyStep(product.unit);
      const amount = Math.max(step, Number(qty) || step);
      setRaw((list) => {
        const found = list.find((l) => l.productId === product.id);
        if (found) {
          return list.map((l) =>
            l.productId === product.id ? { ...l, qty: Math.min(MAX_QTY, round2(l.qty + amount)) } : l
          );
        }
        return [...list, { productId: product.id, qty: Math.min(MAX_QTY, amount) }];
      });
      return { ok: true };
    },
    []
  );

  const setQty = useCallback((productId, qty) => {
    setRaw((list) =>
      list
        .map((l) => (l.productId === productId ? { ...l, qty: Math.min(MAX_QTY, round2(qty)) } : l))
        .filter((l) => l.qty > 0)
    );
  }, []);

  const increase = useCallback(
    (product) => {
      setQty(product.id, (raw.find((l) => l.productId === product.id)?.qty || 0) + qtyStep(product.unit));
    },
    [raw, setQty]
  );

  const decrease = useCallback(
    (product) => {
      const current = raw.find((l) => l.productId === product.id)?.qty || 0;
      setQty(product.id, round2(current - qtyStep(product.unit)));
    },
    [raw, setQty]
  );

  const removeItem = useCallback((productId) => {
    setRaw((list) => list.filter((l) => l.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setRaw([]), []);

  const totals = useMemo(() => {
    // Only available items count toward the payable subtotal.
    const payable = items.filter((i) => !i.unavailable);
    const subtotal = round2(payable.reduce((s, i) => s + i.lineTotal, 0));
    const deliveryCharge = calcDelivery(subtotal);
    return {
      subtotal,
      deliveryCharge,
      total: round2(subtotal + deliveryCharge),
      itemCount: items.length,
      hasUnavailable: items.some((i) => i.unavailable),
      payableCount: payable.length,
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items, totals, drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addToCart, setQty, increase, decrease, removeItem, clearCart,
    }),
    [items, totals, drawerOpen, addToCart, setQty, increase, decrease, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
