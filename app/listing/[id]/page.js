import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Gallery from "@/components/Gallery";
import ProductActions from "@/components/ProductActions";
import ListingCard from "@/components/ListingCard";
import { getSession } from "@/lib/auth";
import { money, SHIPPING_FEE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const doc = await Listing.findById(params.id).select("-images").lean();
  const session = await getSession();
  const live = doc && (doc.status === "available" || doc.status === "sold");
  if (!doc || (!live && session?.role !== "admin")) notFound();
  const l = JSON.parse(JSON.stringify(doc));
  const more = JSON.parse(
    JSON.stringify(
      await Listing.find({ category: l.category, status: "available", _id: { $ne: l._id } })
        .select("-images").sort({ createdAt: -1 }).limit(4).lean()
    )
  );

  const details = [
    ["Size", l.size],
    ["Condition", l.condition],
    ["Category", l.category],
    l.brand && ["Brand", l.brand],
  ].filter(Boolean);

  return (
    <div className="py-8">
      <Link href="/shop" className="text-sm font-medium text-muted hover:text-ink">← Back to shop</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery id={l._id} count={l.imageCount || 1} title={l.title} />
        <div className="lg:pt-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">{l.brand || l.category}</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight sm:text-5xl">{l.title}</h1>
          <p className="mt-4 font-display text-4xl font-bold">{money(l.price)}</p>
          <p className="mt-1 text-xs text-muted">+ {money(SHIPPING_FEE)} shipping · test checkout</p>

          <div className="mt-6"><ProductActions listing={l} /></div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {details.map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</p>
                <p className="mt-1 font-semibold">{v}</p>
              </div>
            ))}
          </div>

          {l.description && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{l.description}</p>
            </div>
          )}

        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-bold">More in {l.category}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {more.map((m) => <ListingCard key={m._id} l={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
