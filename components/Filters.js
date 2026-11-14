"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORIES, SIZES, CONDITIONS } from "@/lib/constants";

export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");
  useEffect(() => {
    setQ(sp.get("q") || "");
    setMin(sp.get("min") || "");
    setMax(sp.get("max") || "");
  }, [sp]);

  const set = (patch) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/shop?${p.toString()}`);
  };
  const cat = sp.get("category");

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); set({ q, min, max }); }} className="flex flex-col gap-3 sm:flex-row">
        <input className="input flex-1" placeholder="Search brands, items, styles…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-3">
          <input className="input w-24" type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
          <input className="input w-24" type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
          <button className="btn btn-primary">Apply</button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={sp.get("size") || ""} onChange={(e) => set({ size: e.target.value })}>
          <option value="">Any size</option>
          {SIZES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={sp.get("condition") || ""} onChange={(e) => set({ condition: e.target.value })}>
          <option value="">Any condition</option>
          {CONDITIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={sp.get("sort") || ""} onChange={(e) => set({ sort: e.target.value })}>
          <option value="">Newest</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
        {sp.toString() && (
          <button onClick={() => router.push("/shop")} className="text-sm font-semibold underline underline-offset-4">Clear all</button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => set({ category: "" })} className={`chip shrink-0 ${!cat ? "chip-active" : ""}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => set({ category: c })} className={`chip shrink-0 ${cat === c ? "chip-active" : ""}`}>{c}</button>
        ))}
      </div>
    </div>
  );
}
