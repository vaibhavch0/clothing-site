import Link from "next/link";
import { money } from "@/lib/constants";

export default function ListingCard({ l }) {
  const id = l._id;
  return (
    <Link href={`/listing/${id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-line shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/listings/${id}/image/0`}
          alt={l.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          {l.size}
        </span>
        {l.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/55 text-lg font-bold uppercase tracking-widest text-white">
            Sold
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{l.title}</p>
          <p className="truncate text-xs text-muted">{[l.brand, l.condition].filter(Boolean).join(" · ")}</p>
        </div>
        <p className="font-display text-base font-bold">{money(l.price)}</p>
      </div>
    </Link>
  );
}
