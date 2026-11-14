"use client";
import { useState } from "react";

export default function Gallery({ id, count, title }) {
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {count > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {Array.from({ length: count }).map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              className={`h-20 w-16 overflow-hidden rounded-xl border-2 transition ${i === n ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/listings/${id}/image/${n}`} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="aspect-[4/5] flex-1 overflow-hidden rounded-[2rem] bg-line shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/listings/${id}/image/${i}`} alt={title} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
