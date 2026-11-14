import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import ListingCard from "@/components/ListingCard";
import DbNotice from "@/components/DbNotice";
import { CATEGORIES, FREE_SHIPPING_MIN, money } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    await connectDB();
    const docs = await Listing.find({ status: "available" }).select("-images").sort({ createdAt: -1 }).limit(40).lean();
    return { listings: JSON.parse(JSON.stringify(docs)) };
  } catch (e) {
    return { error: e.message };
  }
}

const TILE_BG = ["bg-[#E9E4D8]", "bg-[#C9D6E8]", "bg-[#E8CFC8]", "bg-[#CFD8C4]"];
const TICKER = ["Hand-picked pieces", "Every item reviewed", `Free shipping over ${money(FREE_SHIPPING_MIN)}`, "New arrivals · Streetwear"];

export default async function Home() {
  const { listings = [], error } = await getData();
  const hero = listings.slice(0, 3);
  const justIn = listings.slice(0, 10);
  const tiles = ["Outerwear", "Dresses", "Shoes", "Streetwear"].map((c, i) => ({
    c, i, item: listings.find((l) => l.category === c) || listings[i],
  }));
  const budget = listings.filter((l) => l.price <= 1500).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="-mx-4 sm:-mx-8">
        <div className="relative overflow-hidden bg-[#D6FF3F]">
          <div className="mx-auto grid min-h-[560px] max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:py-20">
            <div className="animate-rise">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em]">New drop · Latest collection</p>
              <h1 className="display mt-5 text-[clamp(3.2rem,9vw,8rem)]">
                Fresh fits.<br />New season.
              </h1>
              <p className="mt-6 max-w-md text-base font-medium">
                Hand-picked new clothing. Every piece is reviewed and priced by our team.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-primary px-8 py-4 text-sm uppercase tracking-wider">Shop new in</Link>
                <Link href="/shop?sale=1" className="btn border-2 border-ink px-8 py-4 text-sm uppercase tracking-wider hover:bg-ink hover:text-white">Shop sale</Link>
              </div>
            </div>

            {/* Collage of real products */}
            <div className="relative mx-auto hidden h-[480px] w-full max-w-[520px] lg:block">
              {hero.map((l, i) => (
                <Link
                  key={l._id}
                  href={`/listing/${l._id}`}
                  className="absolute w-[56%] overflow-hidden bg-white p-2 shadow-lift transition duration-500 hover:z-10 hover:scale-105"
                  style={[
                    { left: 0, top: "6%", transform: "rotate(-5deg)" },
                    { right: 0, top: 0, transform: "rotate(4deg)" },
                    { left: "22%", bottom: 0, transform: "rotate(-1deg)" },
                  ][i]}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/listings/${l._id}/image/0`} alt={l.title} className="aspect-[3/4] w-full object-cover" />
                  <div className="flex justify-between px-1 pb-0.5 pt-2 text-xs font-bold"><span className="truncate">{l.title}</span><span>{money(l.price)}</span></div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden bg-ink py-3 text-white">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="mx-8 text-xs font-extrabold uppercase tracking-[0.2em]">{t} <span className="ml-8 text-lime">●</span></span>
            ))}
          </div>
        </div>
      </section>

      {error && <DbNotice error={error} />}

      {/* SHOP BY CATEGORY */}
      {!error && (
        <section className="mt-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="display text-4xl sm:text-5xl">Shop by category</h2>
            <Link href="/shop" className="hidden text-sm font-bold underline underline-offset-4 sm:block">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map(({ c, i, item }) => (
              <Link key={c} href={`/shop?category=${c}`} className={`group relative aspect-[3/4] overflow-hidden ${TILE_BG[i]}`}>
                {item && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/listings/${item._id}/image/0`} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-16 sm:p-5">
                  <p className="display break-words text-[clamp(0.95rem,4.6vw,1.5rem)] text-white sm:text-3xl lg:text-4xl">{c}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-lime sm:text-xs">Shop now →</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((c) => <Link key={c} href={`/shop?category=${c}`} className="chip shrink-0">{c}</Link>)}
          </div>
        </section>
      )}

      {/* JUST IN */}
      {!error && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="display text-4xl sm:text-5xl">Just in</h2>
            <Link href="/shop" className="text-sm font-bold underline underline-offset-4">Shop all →</Link>
          </div>
          {justIn.length === 0 ? (
            <div className="bg-paper p-12 text-center">
              <p className="display text-3xl">New pieces are on the way</p>
              <p className="mt-2 text-sm text-muted">Check back soon.</p>
            </div>
          ) : (
            <div className="-mx-4 flex snap-x scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:-mx-8 sm:scroll-pl-8 sm:px-8">
              {justIn.map((l) => <ListingCard key={l._id} l={l} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[22%] xl:w-[18.5%]" />)}
            </div>
          )}
        </section>
      )}

      {/* PROMO BANNER */}
      {!error && (
        <section className="mt-16 grid gap-3 md:grid-cols-2">
          <Link href="/shop?max=1500&sort=low" className="group relative flex min-h-[320px] items-end overflow-hidden bg-ink p-8 text-white">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-lime/90 transition duration-500 group-hover:scale-110" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Budget finds</p>
              <p className="display mt-3 text-5xl sm:text-6xl">Under<br />{money(1500)}</p>
              <p className="mt-4 text-sm font-bold underline underline-offset-4">Shop now</p>
            </div>
          </Link>
          <Link href="/shop?category=Vintage" className="group relative flex min-h-[320px] items-end overflow-hidden bg-[#E8CFC8] p-8">
            <div className="absolute -left-10 -top-16 h-72 w-72 rounded-full bg-white/60 transition duration-500 group-hover:scale-110" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em]">Retro revival</p>
              <p className="display mt-3 text-5xl sm:text-6xl">Vintage<br />picks</p>
              <p className="mt-4 text-sm font-bold underline underline-offset-4">Explore</p>
            </div>
          </Link>
        </section>
      )}

      {!error && budget.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-6 text-4xl sm:text-5xl">Easy on the wallet</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {budget.map((l) => <ListingCard key={l._id} l={l} />)}
          </div>
        </section>
      )}

      {/* TRUST */}
      <section className="mt-24 grid gap-px bg-line sm:grid-cols-3">
        {[
          ["Reviewed by us", "Every item is checked and priced by our team before it goes live."],
          ["Free shipping", `On all orders over ${money(FREE_SHIPPING_MIN)}. Flat rate below that.`],
          ["Limited stock", "Each style is in limited supply. When it's gone, it's gone."],
        ].map(([t, d]) => (
          <div key={t} className="bg-white p-8">
            <p className="display text-2xl">{t}</p>
            <p className="mt-2 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>
    </>
  );
}
