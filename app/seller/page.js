"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/Providers";
import OrderStatus from "@/components/OrderStatus";
import { money } from "@/lib/constants";

const STATUS = {
  pending: ["Under review", "bg-lime"],
  available: ["Live in store", "bg-ink text-white"],
  sold: ["Sold", "bg-paper"],
  rejected: ["Rejected", "bg-red-100 text-red-700"],
};

export default function Seller() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([fetch("/api/listings?mine=1"), fetch("/api/orders")]);
    if (a.ok) setListings((await a.json()).listings);
    if (b.ok) setSales((await b.json()).sales);
    setLoading(false);
  }, []);
  useEffect(() => { if (user?.role === "seller") load(); else setLoading(false); }, [user, load]);

  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Seller dashboard</h1>
        <p className="mt-2 text-sm text-muted">Log in with your seller account.</p>
        <Link href="/login?next=/seller" className="btn btn-primary mt-6">Log in</Link>
      </div>
    );
  if (user.role !== "seller")
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Sellers only</h1>
        <p className="mt-2 text-sm text-muted">This area is for approved sellers. Seller accounts are created by our team.</p>
        <Link href="/" className="btn btn-primary mt-6">Back home</Link>
      </div>
    );

  const withdraw = async (l) => {
    if (!confirm(`Withdraw "${l.title}"?`)) return;
    await fetch(`/api/listings/${l._id}`, { method: "DELETE" });
    load();
  };
  const ship = async (orderId, itemId) => {
    await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, status: "shipped" }) });
    load();
  };

  const saleItems = sales.flatMap((o) => o.items.map((i) => ({ ...i, orderId: o._id, shipping: o.shipping, createdAt: o.createdAt })));
  const toShip = saleItems.filter((i) => i.status === "paid").length;
  const stats = [
    ["Under review", listings.filter((l) => l.status === "pending").length],
    ["Live in store", listings.filter((l) => l.status === "available").length],
    ["Orders to ship", toShip],
    ["Items sold", saleItems.length],
  ];

  return (
    <div className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-widest ring-1 ring-ink">Seller</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{user.name}&apos;s shop</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">Submit products with your price. We review them, may adjust the price, and publish them to the store.</p>
        </div>
        <Link href="/sell" className="btn btn-lime px-6 py-3">+ Add product</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className={`card p-6 ${k === "Orders to ship" && toShip ? "ring-2 ring-lime" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</p>
            <p className="mt-2 font-display text-3xl font-bold sm:text-4xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-2">
        <button onClick={() => setTab("products")} className={`chip ${tab === "products" ? "chip-active" : ""}`}>My products ({listings.length})</button>
        <button onClick={() => setTab("orders")} className={`chip ${tab === "orders" ? "chip-active" : ""}`}>
          Orders ({saleItems.length}){toShip > 0 && <span className="ml-2 h-2 w-2 rounded-full bg-lime ring-1 ring-ink" />}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-muted">Loading…</p>}

        {tab === "products" && !loading && listings.length === 0 && (
          <div className="card p-12 text-center">
            <p className="font-display text-xl font-bold">No products yet</p>
            <p className="mt-1 text-sm text-muted">Add your first product and we&apos;ll review it.</p>
            <Link href="/sell" className="btn btn-primary mt-5">+ Add product</Link>
          </div>
        )}
        {tab === "products" && listings.map((l) => {
          const [label, cls] = STATUS[l.status] || STATUS.pending;
          const changed = l.status !== "pending" && l.price !== l.sellerPrice;
          return (
            <div key={l._id} className="card p-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/listings/${l._id}/image/0`} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.title}</p>
                  <p className="text-sm text-muted">
                    You asked {money(l.sellerPrice ?? l.price)}
                    {changed && <> · <span className="font-semibold text-ink">store price {money(l.price)}</span></>}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{label}</span>
                {(l.status === "pending" || l.status === "rejected") && (
                  <button onClick={() => withdraw(l)} className="btn btn-ghost px-4 py-2 text-red-600">Withdraw</button>
                )}
              </div>
              {l.status === "rejected" && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  Not approved{l.adminNote ? `: ${l.adminNote}` : "."} You can withdraw it and submit a new one.
                </p>
              )}
            </div>
          );
        })}

        {tab === "orders" && !loading && saleItems.length === 0 && (
          <div className="card p-12 text-center text-sm text-muted">No orders yet. When a customer buys your product it shows here with their shipping address.</div>
        )}
        {tab === "orders" && saleItems.map((i) => (
          <div key={i._id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{i.title}</p>
                <p className="text-sm text-muted">{money(i.price)} · {new Date(i.createdAt).toLocaleDateString()}</p>
              </div>
              <OrderStatus status={i.status} />
              {i.status === "paid" && <button onClick={() => ship(i.orderId, i._id)} className="btn btn-lime px-4 py-2">Mark shipped</button>}
            </div>
            <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-muted">
              <span className="font-semibold text-ink">Ship to:</span> {i.shipping.name}, {i.shipping.address}, {i.shipping.city} {i.shipping.zip} {i.shipping.country}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
