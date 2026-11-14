"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CATEGORIES, SIZES } from "@/lib/constants";

const RANGES = [
  ["Under ₹1,000", "", "1000"],
  ["₹1,000 – ₹2,500", "1000", "2500"],
  ["Above ₹2,500", "2500", ""],
];

function Section({ title, children, open = true }) {
  return (
    <details open={open} className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-extrabold uppercase tracking-wider">
        {title}
        <span className="text-lg font-normal transition group-open:rotate-45">+</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export default function Filters({ count }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [show, setShow] = useState(false);
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");
  const [q, setQ] = useState(sp.get("q") || "");
  useEffect(() => {
    setMin(sp.get("min") || "");
    setMax(sp.get("max") || "");
    setQ(sp.get("q") || "");
  }, [sp]);

  const set = (patch) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/shop?${p.toString()}`);
  };
  const cat = sp.get("category");
  const size = sp.get("size");
  const sale = sp.get("sale");
  const active = [...sp.keys()].filter((k) => k !== "sort").length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button onClick={() => setShow(!show)} className="btn btn-ghost !rounded-none uppercase tracking-wider">
          Filters{active > 0 && ` (${active})`} {show ? "−" : "+"}
        </button>
        <SortSelect sp={sp} set={set} />
      </div>

      <div className={`${show ? "block" : "hidden"} lg:block`}>
        <div className="mt-4 hidden items-center justify-between pb-3 lg:flex">
          <p className="text-sm font-extrabold uppercase tracking-wider">{count} items</p>
          {active > 0 && <button onClick={() => router.push("/shop")} className="text-xs font-bold underline underline-offset-4">Clear all</button>}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); set({ q }); }} className="mt-4 lg:mt-0">
          <input className="input !rounded-none" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <Section title="Category">
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => set({ category: "" })} className={!cat ? "font-extrabold" : "text-muted hover:text-ink"}>All</button></li>
            {CATEGORIES.map((c) => (
              <li key={c}><button onClick={() => set({ category: c })} className={cat === c ? "font-extrabold" : "text-muted hover:text-ink"}>{c}</button></li>
            ))}
          </ul>
        </Section>

        <div className="border-b border-line py-4">
          <label className="flex cursor-pointer items-center justify-between text-sm font-extrabold uppercase tracking-wider text-sale">
            On sale
            <input type="checkbox" checked={!!sale} onChange={() => set({ sale: sale ? "" : "1" })} className="h-4 w-4 accent-red-600" />
          </label>
        </div>

        <Section title="Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button key={s} onClick={() => set({ size: size === s ? "" : s })}
                className={`min-w-11 border px-3 py-2 text-xs font-bold transition ${size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>{s}</button>
            ))}
          </div>
        </Section>

        <Section title="Price">
          <div className="space-y-2 text-sm">
            {RANGES.map(([label, lo, hi]) => (
              <button key={label} onClick={() => set({ min: lo, max: hi })}
                className={`block ${min === lo && max === hi ? "font-extrabold" : "text-muted hover:text-ink"}`}>{label}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); set({ min, max }); }} className="mt-4 flex gap-2">
            <input className="input !rounded-none" type="number" min="0" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
            <input className="input !rounded-none" type="number" min="0" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
            <button className="bg-ink px-4 text-sm font-bold text-white">Go</button>
          </form>
        </Section>
      </div>
    </div>
  );
}

export function SortSelect({ sp, set }) {
  return (
    <select className="input !w-auto !rounded-none !py-2.5 text-xs font-bold uppercase tracking-wider" value={sp.get("sort") || ""} onChange={(e) => set({ sort: e.target.value })}>
      <option value="">Newest</option>
      <option value="low">Price: low to high</option>
      <option value="high">Price: high to low</option>
    </select>
  );
}
