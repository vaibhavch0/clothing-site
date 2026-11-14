"use client";
import { useState } from "react";
import { CATEGORIES, SIZES, CONDITIONS, money } from "@/lib/constants";

// Admin edit form for one product. Used both for the review queue and for editing live items.
export default function ReviewCard({ listing: l, onDone }) {
  const [f, setF] = useState({
    title: l.title, brand: l.brand || "", category: l.category, size: l.size,
    condition: l.condition, description: l.description || "", price: l.price,
  });
  const [note, setNote] = useState(l.adminNote || "");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const live = l.status === "available" || l.status === "sold";

  const send = async (action) => {
    setErr("");
    setBusy(action || "save");
    const res = await fetch(`/api/admin/listings/${l._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, adminNote: note, action }),
    });
    const data = await res.json();
    setBusy("");
    if (!res.ok) return setErr(data.error || "Something went wrong.");
    onDone();
  };

  return (
    <div className="card grid gap-6 p-5 sm:p-6 md:grid-cols-[180px_1fr]">
      <div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {Array.from({ length: l.imageCount || 1 }).map((_, n) => (
            <a key={n} href={`/api/listings/${l._id}/image/${n}`} target="_blank" rel="noreferrer"
              className="block aspect-[4/5] overflow-hidden rounded-2xl bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/listings/${l._id}/image/${n}`} alt="" className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-paper px-3 py-1 font-semibold">Seller: {l.seller?.name || "—"}</span>
          <span className="rounded-full bg-lime px-3 py-1 font-bold">Seller asked {money(l.sellerPrice ?? l.price)}</span>
          <span className="rounded-full bg-paper px-3 py-1 font-semibold capitalize">{l.status}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Title</label><input className="input" value={f.title} onChange={set("title")} /></div>
          <div><label className="label">Brand</label><input className="input" value={f.brand} onChange={set("brand")} /></div>
          <div>
            <label className="label">Customer price</label>
            <input className="input" type="number" min="1" step="0.01" value={f.price} onChange={set("price")} />
          </div>
          <div><label className="label">Category</label>
            <select className="input" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Size</label>
            <select className="input" value={f.size} onChange={set("size")}>{SIZES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="label">Condition</label>
            <select className="input" value={f.condition} onChange={set("condition")}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="label">Description</label>
            <textarea className="input min-h-24" value={f.description} onChange={set("description")} /></div>
          {!live && (
            <div className="sm:col-span-2"><label className="label">Note to seller (shown if rejected)</label>
              <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Photos are too dark, please resubmit" /></div>
          )}
        </div>

        {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}

        <div className="flex flex-wrap gap-2">
          {!live ? (
            <>
              <button disabled={!!busy} onClick={() => send("publish")} className="btn btn-lime">{busy === "publish" ? "Publishing…" : "Publish to store"}</button>
              <button disabled={!!busy} onClick={() => send(undefined)} className="btn btn-ghost">Save draft</button>
              {l.status !== "rejected" && <button disabled={!!busy} onClick={() => send("reject")} className="btn btn-ghost text-red-600">Reject</button>}
            </>
          ) : (
            <>
              <button disabled={!!busy} onClick={() => send(undefined)} className="btn btn-primary">{busy === "save" ? "Saving…" : "Save changes"}</button>
              <button disabled={!!busy} onClick={() => send("unpublish")} className="btn btn-ghost">Unpublish</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
