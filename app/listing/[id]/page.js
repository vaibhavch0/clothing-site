import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import Gallery from "@/components/Gallery";
import ProductActions from "@/components/ProductActions";
import ListingCard from "@/components/ListingCard";
import { getSession } from "@/lib/auth";
import { priceInfo } from "@/lib/pricing";
import { PUBLIC_DETAIL_FIELDS, PUBLIC_FIELDS } from "@/lib/queries";
import { money, SHIPPING_FEE, FREE_SHIPPING_MIN } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ListingPage(props) {
  const params = await props.params;
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const doc = await Listing.findById(params.id).select(PUBLIC_DETAIL_FIELDS).lean();
  const session = await getSession();
  const live = doc && (doc.status === "available" || doc.status === "sold");
  if (!doc || (!live && session?.role !== "admin")) notFound();
  const l = JSON.parse(JSON.stringify(doc));
  const more = JSON.parse(
    JSON.stringify(
      await Listing.find({ category: l.category, status: "available", _id: { $ne: l._id } })
        .select(PUBLIC_FIELDS).sort({ createdAt: -1 }).limit(4).lean()
    )
  );

  const { mrp, pct, save } = priceInfo(l);

  return (
    <div className="py-6 sm:py-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/shop" className="hover:text-ink">Shop</Link> /{" "}
        <Link href={`/shop?category=${l.category}`} className="hover:text-ink">{l.category}</Link>
      </nav>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.25fr_1fr]">
        <Gallery id={l._id} count={l.imageCount || 1} title={l.title} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          {l.brand && <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-muted">{l.brand}</p>}
          <h1 className="display mt-2 text-4xl sm:text-5xl">{l.title}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className={`text-3xl font-extrabold ${mrp ? "text-sale" : ""}`}>{money(l.price)}</p>
            {mrp && <p className="text-lg text-muted line-through">{money(mrp)}</p>}
            {mrp && <span className="bg-sale px-2 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white">{pct}% off</span>}
          </div>
          {mrp && <p className="mt-1 text-sm font-semibold text-sale">You save {money(save)}</p>}
          <p className="mt-1 text-xs text-muted">
            {l.price >= FREE_SHIPPING_MIN ? "Free shipping on this item" : `+ ${money(SHIPPING_FEE)} shipping · free over ${money(FREE_SHIPPING_MIN)}`}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 border-y border-line py-4 text-sm">
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-muted">Size</p><p className="mt-1 inline-block border-2 border-ink px-3 py-1 font-bold">{l.size}</p></div>
            <div><p className="text-[11px] font-bold uppercase tracking-widest text-muted">Category</p><p className="mt-1 py-1 font-bold">{l.category}</p></div>
          </div>

          <div className="mt-6"><ProductActions listing={l} /></div>

          <div className="mt-8 divide-y divide-line border-y border-line text-sm">
            <details open className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold uppercase tracking-wider">
                Description <span className="text-lg font-normal transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 whitespace-pre-line text-muted">{l.description || "No description provided."}</p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-extrabold uppercase tracking-wider">
                Shipping <span className="text-lg font-normal transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">Flat {money(SHIPPING_FEE)} shipping, free on orders over {money(FREE_SHIPPING_MIN)}. Each listing is a single piece, so once it sells it's gone.</p>
            </details>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section className="mt-24">
          <h2 className="display mb-6 text-3xl sm:text-4xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {more.map((m) => <ListingCard key={m._id} l={m} />)}
          </div>
        </section>
      )}
    </div>
  );
}
