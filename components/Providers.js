"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthCtx = createContext(null);
const CartCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export const useCart = () => useContext(CartCtx);

export default function Providers({ initialUser, children }) {
  const [user, setUser] = useState(initialUser);
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("styio_cart") || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("styio_cart", JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item) => setItems((c) => (c.some((i) => i.id === item.id) ? c : [...c, item])), []);
  const remove = useCallback((id) => setItems((c) => c.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, logout }}>
      <CartCtx.Provider value={{ items, add, remove, clear, ready }}>{children}</CartCtx.Provider>
    </AuthCtx.Provider>
  );
}
