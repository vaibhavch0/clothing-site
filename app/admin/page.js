"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/Providers";
import ReviewCard from "@/components/ReviewCard";
import OrderStatus from "@/components/OrderStatus";
import { money } from "@/lib/constants";

const BADGE = {
  pending: "bg-lime", available: "bg-ink text-white", sold: "bg-paper", rejected: "bg-red-100 text-red-700",
};

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("queue");
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // listing id being edited
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([fetch("/api/admin/listings"), fetch("/api/admin/users"), fetch("/api/admin/orders")]);
    if (a.ok) setListings((await a.json()).listings);
    if (b.ok) setUsers((await b.json()).users);
    if (c.ok) setOrders((await c.json()).orders);
    setLoading(false);
  }, []);
  useEffect(() => { if (user?.role === "admin") load(); else setLoading(false); }, [user, load]);

  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Link href="/login?next=/admin" className="btn btn-primary mt-6">Log in</Link>
      </div>
    );
  if (user.role !== "admin")
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Not allowed</h1>
        <p className="mt-2 text-sm text-muted">This area is for administrators only.</p>
        <Link href="/" className="btn btn-primary mt-6">Back home</Link>
      </div>
    );

  const pending = listings.filter((l) => l.status === "pending");
  const sellers = users.filter((u) => u.role === "seller");
  const live = listings.filter((l) => l.status === "available").length;
  const revenue = orders.reduce((a, o) => a + (o.subtotal || 0), 0);

  const act = async (l, body) => {
    await fetch(`/api/admin/listings/${l._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  };
  const del = async (l) => {
    if (!confirm(`Permanently delete "${l.title}"?`)) return;
    await fetch(`/api/admin/listings/${l._id}`, { method: "DELETE" });
    load();
  };
  const setRole = async (u, role) => {
    await fetch(`/api/admin/users/${u._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    load();
  };
  const createSeller = async (e) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "Failed");
    setMsg(`Seller created. Share the email and password with ${form.name}.`);
    setForm({ name: "", email: "", password: "" });
    load();
  };

  const stats = [["Awaiting review", pending.length], ["Live products", live], ["Sellers", sellers.length], ["Revenue", money(revenue)]];
  const tabs = [["queue", `Review queue (${pending.length})`], ["products", "All products"], ["sellers", "Sellers"], ["orders", `Orders (${orders.length})`]];

  return (
    <div className="py-10">
      <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">Admin</span>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Control room</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className={`card p-6 ${k === "Awaiting review" && pending.length ? "ring-2 ring-lime" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</p>
            <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} className={`chip shrink-0 ${tab === k ? "chip-active" : ""}`}>{t}</button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-sm text-muted">Loading…</p>}

        {/* Review queue */}
        {tab === "queue" && !loading && pending.length === 0 && (
          <div className="card p-12 text-center text-sm text-muted">Nothing waiting. New seller submissions appear here for you to price and publish.</div>
        )}
        {tab === "queue" && pending.map((l) => <ReviewCard key={l._id} listing={l} onDone={load} />)}

        {/* All products */}
        {tab === "products" && listings.map((l) => (
          <div key={l._id}>
            <div className="card flex flex-wrap items-center gap-4 p-3">
              <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/listings/${l._id}/image/0`} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{l.title}</p>
                <p className="text-sm text-muted">by {l.seller?.name || "—"} · asked {money(l.sellerPrice ?? l.price)} · store {money(l.price)}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${BADGE[l.status]}`}>{l.status}</span>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setOpen(open === l._id ? null : l._id)} className="btn btn-ghost px-4 py-2">{open === l._id ? "Close" : "Edit"}</button>
                {l.status === "available" && <button onClick={() => act(l, { action: "markSold" })} className="btn btn-ghost px-4 py-2">Mark sold</button>}
                {l.status === "sold" && <button onClick={() => act(l, { action: "relist" })} className="btn btn-ghost px-4 py-2">Relist</button>}
                <button onClick={() => del(l)} className="btn btn-ghost px-4 py-2 text-red-600">Delete</button>
              </div>
            </div>
            {open === l._id && <div className="mt-3"><ReviewCard listing={l} onDone={() => { setOpen(null); load(); }} /></div>}
          </div>
        ))}
        {tab === "products" && !loading && listings.length === 0 && <div className="card p-12 text-center text-sm text-muted">No products yet.</div>}

        {/* Sellers */}
        {tab === "sellers" && (
          <>
            <form onSubmit={createSeller} className="card grid gap-3 p-5 sm:grid-cols-4 sm:items-end">
              <div><label className="label">Seller name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Password</label><input className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <button className="btn btn-lime py-3">+ Create seller</button>
              {msg && <p className="text-sm text-muted sm:col-span-4">{msg}</p>}
            </form>

            <h2 className="pt-4 text-xl font-bold">Sellers ({sellers.length})</h2>
            {sellers.length === 0 && <p className="text-sm text-muted">No sellers yet. Create one above.</p>}
            {sellers.map((u) => (
              <div key={u._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div><p className="font-semibold">{u.name}</p><p className="text-sm text-muted">{u.email} · {u.products} product{u.products === 1 ? "" : "s"}</p></div>
                <button onClick={() => setRole(u, "customer")} className="btn btn-ghost px-4 py-2 text-red-600">Remove seller access</button>
              </div>
            ))}

            <h2 className="pt-4 text-xl font-bold">Customers</h2>
            {users.filter((u) => u.role === "customer").map((u) => (
              <div key={u._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div><p className="font-semibold">{u.name}</p><p className="text-sm text-muted">{u.email}</p></div>
                <button onClick={() => setRole(u, "seller")} className="btn btn-ghost px-4 py-2">Make seller</button>
              </div>
            ))}
          </>
        )}

        {/* Orders */}
        {tab === "orders" && !loading && orders.length === 0 && <div className="card p-12 text-center text-sm text-muted">No orders yet.</div>}
        {tab === "orders" && orders.map((o) => (
          <div key={o._id} className="card p-5">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold">{o.buyer?.name} <span className="font-normal text-muted">· {o.buyer?.email}</span></span>
              <span className="font-display font-bold">{money(o.total)} <span className="text-xs font-normal text-muted">{new Date(o.createdAt).toLocaleDateString()}</span></span>
            </div>
            <div className="mt-3 space-y-3">
              {o.items.map((i) => (
                <div key={i._id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span>{i.title} <span className="text-muted">· {money(i.price)} · seller {i.seller?.name || "—"}</span></span>
                  <OrderStatus status={i.status} />
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-paper p-3 text-xs text-muted">Ship to: {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.zip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
