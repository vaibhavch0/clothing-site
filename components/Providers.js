"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthCtx = createContext(null);
const CartCtx = createContext(null);
const WishCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export const useCart = () => useContext(CartCtx);
export const useWishlist = () => useContext(WishCtx);

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

  const add = useCallback((item) => setItems((c) => (c.some((i) => i.id === item.id) ? c : [...c, item])), [setItems]);
  const remove = useCallback((id) => setItems((c) => c.filter((i) => i.id !== id)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);
  const toggleWish = useCallback(
    (item) => setWish((w) => (w.some((i) => i.id === item.id) ? w.filter((i) => i.id !== item.id) : [...w, item])),
    [setWish]
  );

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, logout }}>
      <CartCtx.Provider value={{ items, add, remove, clear, ready }}>
        <WishCtx.Provider value={{ wish, toggleWish }}>{children}</WishCtx.Provider>
      </CartCtx.Provider>
    </AuthCtx.Provider>
  );
}
