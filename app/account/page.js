"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/Providers";
import OrderStatus from "@/components/OrderStatus";
import { money } from "@/lib/constants";

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders((await res.json()).purchases);
    else setErr((await res.json()).error || "Couldn't load orders.");
    setLoading(false);
  }, []);
  useEffect(() => { if (user) load(); else setLoading(false); }, [user, load]);

  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">My account</h1>
        <p className="mt-2 text-sm text-muted">Log in to see your orders.</p>
        <Link href="/login?next=/account" className="btn btn-primary mt-6">Log in</Link>
      </div>
    );

  const confirm = async (orderId, itemId) => {
    await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, status: "delivered" }) });
    load();
  };

  const spent = orders.reduce((a, o) => a + o.total, 0);
  const itemCount = orders.reduce((a, o) => a + o.items.length, 0);
  const inTransit = orders.reduce((a, o) => a + o.items.filter((i) => i.status === "shipped").length, 0);

  return (
    <div className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Customer</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Hi, {user.name}</h1>
        </div>
        <Link href="/shop" className="btn btn-lime">Keep shopping</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["Orders", orders.length], ["Items bought", itemCount], ["In transit", inTransit]].map(([k, v]) => (
          <div key={k} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</p>
            <p className="mt-2 font-display text-4xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">Total spent: <span className="font-semibold text-ink">{money(spent)}</span></p>

      <h2 className="mt-10 text-2xl font-bold">My orders</h2>
      <div className="mt-4 space-y-4">
        {loading && <p className="text-sm text-muted">Loading…</p>}
        {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        {!loading && !err && orders.length === 0 && (
          <div className="card p-10 text-center">
            <p className="font-display text-xl font-bold">No orders yet</p>
            <p className="mt-1 text-sm text-muted">When you buy something, you&apos;ll track it here.</p>
            <Link href="/shop" className="btn btn-primary mt-5">Browse the shop</Link>
          </div>
        )}
        {orders.map((o) => (
          <div key={o._id} className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-semibold">Order · {new Date(o.createdAt).toLocaleDateString()}</span>
              <span className="font-display font-bold">{money(o.total)}</span>
            </div>
            <div className="mt-4 space-y-4">
              {o.items.map((i) => (
                <div key={i._id} className="flex flex-wrap items-center gap-4">
                  <Link href={`/listing/${i.listing}`} className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/listings/${i.listing}/image/0`} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.title}</p>
                    <p className="text-sm text-muted">{money(i.price)}</p>
                    <div className="mt-2"><OrderStatus status={i.status} /></div>
                  </div>
                  {i.status === "shipped" && (
                    <button onClick={() => confirm(o._id, i._id)} className="btn btn-ghost px-4 py-2">Mark received</button>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-paper p-3 text-xs text-muted">
              Shipping to {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.zip}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
