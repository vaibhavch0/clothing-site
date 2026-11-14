"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const AuthCtx = createContext(null);
const CartCtx = createContext(null);
const WishCtx = createContext(null);
const ToastCtx = createContext(() => {});
export const useAuth = () => useContext(AuthCtx);
export const useCart = () => useContext(CartCtx);
export const useWishlist = () => useContext(WishCtx);
export const useToast = () => useContext(ToastCtx);

function usePersisted(key) {
  const [v, setV] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setV(JSON.parse(localStorage.getItem(key) || "[]")); } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [v, ready, key]);
  return [v, setV, ready];
}

export default function Providers({ initialUser, children }) {
  const [user, setUser] = useState(initialUser);
  const [items, setItems, ready] = usePersisted("styio_cart");
  const [wish, setWish] = usePersisted("styio_wish");
  // One small message at a time, bottom of the screen, auto-hides.
  const [toast, setToast] = useState(null);
  const notify = useCallback((msg, action) => setToast({ msg, action, key: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((item) => setItems((c) => (c.some((i) => i.id === item.id) ? c : [...c, item])), [setItems]);
  const remove = useCallback((id) => setItems((c) => c.filter((i) => i.id !== id)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);
  const replace = useCallback((next) => setItems(next), [setItems]);
  const removeMany = useCallback((ids) => setItems((c) => c.filter((i) => !ids.includes(i.id))), [setItems]);
  const toggleWish = useCallback(
    (item) => setWish((w) => (w.some((i) => i.id === item.id) ? w.filter((i) => i.id !== item.id) : [...w, item])),
    [setWish]
  );

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Shared phones: the next person shouldn't see this bag or wishlist.
    setItems([]);
    setWish([]);
    try { localStorage.removeItem("styio_cart"); localStorage.removeItem("styio_wish"); } catch {}
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, logout }}>
      <CartCtx.Provider value={{ items, add, remove, clear, replace, removeMany, ready }}>
        <WishCtx.Provider value={{ wish, toggleWish }}>
          <ToastCtx.Provider value={notify}>
            {children}
            <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
              {toast && (
                <div key={toast.key} className="pointer-events-auto flex animate-rise items-center gap-4 bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-lift">
                  <span>{toast.msg}</span>
                  {toast.action && <Link href={toast.action.href} onClick={() => setToast(null)} className="text-lime underline underline-offset-4">{toast.action.label}</Link>}
                </div>
              )}
            </div>
          </ToastCtx.Provider>
        </WishCtx.Provider>
      </CartCtx.Provider>
    </AuthCtx.Provider>
  );
}

// Re-checks the bag against the server once per page view: refreshes prices that the
// admin changed and drops items that sold out, so the shopper never pays a surprise amount.
export function useCartSync() {
  const { items, replace, ready } = useCart();
  const [notice, setNotice] = useState("");
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (!ready || checked) return;
    if (!items.length) { setChecked(true); return; }
    let cancelled = false;
    (async () => {
      const { ok, data } = await api("/api/cart", { method: "POST", body: { ids: items.map((i) => i.id) } });
      if (cancelled) return;
      setChecked(true);
      if (!ok) return;
      const fresh = new Map(data.items.map((i) => [i.id, i]));
      const removed = items.filter((i) => !fresh.has(i.id)).map((i) => i.title);
      const changed = items.filter((i) => fresh.has(i.id) && fresh.get(i.id).price !== i.price).map((i) => i.title);
      if (removed.length || changed.length) replace(items.filter((i) => fresh.has(i.id)).map((i) => ({ ...i, ...fresh.get(i.id) })));
      const msgs = [];
      if (removed.length) msgs.push(`Sold out, removed from your bag: ${removed.join(", ")}.`);
      if (changed.length) msgs.push(`Price updated: ${changed.join(", ")}.`);
      setNotice(msgs.join(" "));
    })();
    return () => { cancelled = true; };
  }, [ready, checked, items, replace]);
  return { notice, checked };
}
