import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import ListingCard from "@/components/ListingCard";
import DbNotice from "@/components/DbNotice";
import { CATEGORIES, BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getNew() {
  try {
    await connectDB();
    const docs = await Listing.find({ status: "available" }).select("-images").sort({ createdAt: -1 }).limit(8).lean();
    return { listings: JSON.parse(JSON.stringify(docs)) };
  } catch (e) {
    return { error: e.message };
  }
}

export default async function Home() {
  const { listings, error } = await getNew();
  return (
    <>
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-white sm:px-14 sm:py-24">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-lime/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Pre-loved · Vintage · Streetwear
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.02] sm:text-7xl">
            Find it. <span className="text-lime">Wear it.</span> Love it again.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/70">
            {BRAND} is a hand-picked store of clothes with a past. Every piece is reviewed and priced by us, so you can shop with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-lime px-7 py-3.5 text-base">Start shopping</Link>
            <Link href="/shop?sort=low" className="btn border border-white/25 px-7 py-3.5 text-base text-white hover:bg-white/10">
              Best prices
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-10 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/shop?category=${c}`} className="chip shrink-0">{c}</Link>
        ))}
      </section>

      {/* New arrivals */}
      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold sm:text-4xl">Fresh drops</h2>
          <Link href="/shop" className="text-sm font-semibold underline underline-offset-4">View all →</Link>
        </div>
        {error ? (
          <DbNotice error={error} />
        ) : listings.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-xl font-bold">New pieces are on the way</p>
            <p className="mt-1 text-sm text-muted">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => <ListingCard key={l._id} l={l} />)}
          </div>
        )}
      </section>

    </>
  );
}
