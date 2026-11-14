"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Providers";
import { CATEGORIES, SIZES, money } from "@/lib/constants";

function resize(file, max = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Sell() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef();
  const [images, setImages] = useState([]);
  const [f, setF] = useState({ title: "", brand: "", category: "", size: "", price: "", description: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (!user)
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Seller login</h1>
        <p className="mt-2 text-sm text-muted">Log in with the seller account we gave you.</p>
        <Link href="/login?next=/sell" className="btn btn-primary mt-6">Log in</Link>
      </div>
    );

  if (user.role !== "seller")
    return (
      <div className="card mx-auto my-20 max-w-md p-10 text-center">
        <h1 className="text-3xl font-bold">Sellers only</h1>
        <p className="mt-2 text-sm text-muted">This page is for approved sellers. Accounts are created by our team.</p>
        <Link href="/" className="btn btn-primary mt-6">Back home</Link>
      </div>
    );

  const addFiles = async (files) => {
    const room = 4 - images.length;
    const out = [];
    for (const file of [...files].slice(0, room)) {
      if (file.type.startsWith("image/")) out.push(await resize(file));
    }
    setImages([...images, ...out]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, images }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || "Something went wrong.");
    router.push("/seller");
    router.refresh();
  };

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Add a product</h1>
      <p className="mt-2 text-muted">Submit your product and price. Our team reviews it, may adjust the price, then publishes it to the store.</p>

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="card space-y-6 p-6 sm:p-8">
          <div>
            <span className="label">Photos ({images.length}/4)</span>
            <div className="grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold">Cover</span>}
                  <button type="button" onClick={() => setImages(images.filter((_, n) => n !== i))}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-xs text-white opacity-0 transition group-hover:opacity-100">✕</button>
                </div>
              ))}
              {images.length < 4 && (
                <button type="button" onClick={() => fileRef.current.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                  className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-muted transition hover:border-ink hover:text-ink">
                  <span className="text-2xl">+</span>
                  <span className="text-[11px] font-semibold">Add photo</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          <div>
            <label className="label">Title</label>
            <input className="input" required maxLength={100} placeholder="e.g. Denim jacket" value={f.title} onChange={set("title")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Brand (optional)</label>
              <input className="input" placeholder="e.g. Levi's" value={f.brand} onChange={set("brand")} />
            </div>
            <div>
              <label className="label">Your price</label>
              <input className="input" required type="number" min="1" step="0.01" placeholder="0.00" value={f.price} onChange={set("price")} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" required value={f.category} onChange={set("category")}>
                <option value="">Select…</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Size</label>
              <select className="input" required value={f.size} onChange={set("size")}>
                <option value="">Select…</option>{SIZES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-28" maxLength={2000} placeholder="Fit, material, any flaws…" value={f.description} onChange={set("description")} />
          </div>
          {err && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className="btn btn-primary w-full py-4 text-base">{busy ? "Submitting…" : "Submit for review"}</button>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <span className="label">Live preview</span>
          <div className="card overflow-hidden p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-line">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted">Your cover photo</div>
              )}
              {f.size && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">{f.size}</span>}
            </div>
            <div className="flex items-start justify-between gap-3 px-2 pb-2 pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{f.title || "Item title"}</p>
                <p className="truncate text-xs text-muted">{f.brand || "Brand"}</p>
              </div>
              <p className="font-display font-bold">{money(f.price || 0)}</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
