import Link from "next/link";
import WishlistButton from "./WishlistButton";
import { money } from "@/lib/constants";
import { priceInfo } from "@/lib/pricing";

const WEEK = 7 * 24 * 3600 * 1000;

export default function ListingCard({ l, className = "" }) {
  const id = l._id;
  const { mrp, pct } = priceInfo(l);
  const isNew = l.status === "available" && Date.now() - new Date(l.createdAt).getTime() < WEEK;
  return (
    <Link href={`/listing/${id}`} className={`group block ${className}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/listings/${id}/image/0`}
          alt={l.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        {l.imageCount > 1 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/listings/${id}/image/1`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-0 top-3 flex flex-col items-start gap-1">
          {pct > 0 && <span className="bg-sale px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">-{pct}%</span>}
          {isNew && <span className="bg-ink px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">New</span>}
        </div>
        <WishlistButton item={{ id, title: l.title, price: l.price }} className="absolute right-2.5 top-2.5" />
        <span className="absolute bottom-2.5 left-2.5 bg-white/95 px-2 py-0.5 text-[11px] font-bold">{l.size}</span>
        {l.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 font-display text-xl font-black uppercase tracking-widest">Sold</div>
        )}
      </div>
      <div className="mt-3">
        <p className="truncate text-[13px] font-semibold">{l.title}</p>
        <p className="mt-0.5 flex items-baseline gap-2 text-[13px]">
          <span className={`font-extrabold ${mrp ? "text-sale" : ""}`}>{money(l.price)}</span>
          {mrp && <span className="text-xs text-muted line-through">{money(mrp)}</span>}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">{l.brand || " "}</p>
      </div>
    </Link>
  );
}
