import { Suspense } from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { buildListingQuery, buildSort, PUBLIC_FIELDS, PAGE_SIZE } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";
import Filters from "@/components/Filters";
import SortBar from "@/components/SortBar";
import DbNotice from "@/components/DbNotice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

// Keep every active filter when moving between pages.
function pageHref(searchParams, page) {
  const p = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => k !== "page" && typeof v === "string" && v && p.set(k, v));
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

export default async function Shop(props) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page, 10) || 1);
  let listings = [];
  let total = 0;
  let error;
  try {
    await connectDB();
    const query = buildListingQuery(searchParams);
    [total, listings] = await Promise.all([
      Listing.countDocuments(query),
      Listing.find(query)
        .select(PUBLIC_FIELDS)
        .sort({ ...buildSort(searchParams.sort), _id: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
    ]);
    listings = JSON.parse(JSON.stringify(listings));
  } catch (e) {
    error = e.message;
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const title = searchParams.sale ? "Sale" : searchParams.category || (searchParams.q ? `“${searchParams.q}”` : "New in");

  return (
    <div className="py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <h1 className="display text-5xl sm:text-7xl">{title}</h1>
        <div className="hidden lg:block">
          <Suspense fallback={null}><SortBar /></Suspense>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[250px_1fr]">
        <aside>
          <Suspense fallback={null}><Filters count={total} /></Suspense>
        </aside>

        <div>
          {error ? (
            <DbNotice error={error} />
          ) : listings.length === 0 ? (
            <div className="bg-paper p-16 text-center">
              <p className="display text-3xl">Nothing matches</p>
              <p className="mt-2 text-sm text-muted">Try loosening your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-3 2xl:grid-cols-4">
                {listings.map((l) => <ListingCard key={l._id} l={l} />)}
              </div>

              {pages > 1 && (
                <nav className="mt-14 flex flex-wrap items-center justify-center gap-2 text-sm font-bold" aria-label="Pages">
                  {page > 1 && <Link href={pageHref(searchParams, page - 1)} className="border border-line px-4 py-2.5 hover:border-ink">← Prev</Link>}
                  {Array.from({ length: pages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                    .map((n, i, arr) => (
                      <span key={n} className="flex items-center gap-2">
                        {i > 0 && n - arr[i - 1] > 1 && <span className="text-muted">…</span>}
                        <Link href={pageHref(searchParams, n)}
                          className={`min-w-11 border px-3 py-2.5 text-center ${n === page ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}>{n}</Link>
                      </span>
                    ))}
                  {page < pages && <Link href={pageHref(searchParams, page + 1)} className="border border-line px-4 py-2.5 hover:border-ink">Next →</Link>}
                </nav>
              )}
              <p className="mt-4 text-center text-xs text-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + listings.length} of {total}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
