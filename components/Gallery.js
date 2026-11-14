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
              className={`h-24 w-[72px] overflow-hidden border-2 transition ${i === n ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/listings/${id}/image/${n}`} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="aspect-[3/4] flex-1 overflow-hidden bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/listings/${id}/image/${i}`} alt={title} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
