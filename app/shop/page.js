import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { buildListingQuery, buildSort } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";
import Filters from "@/components/Filters";
import SortBar from "@/components/SortBar";
import DbNotice from "@/components/DbNotice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function Shop(props) {
  const searchParams = await props.searchParams;
  let listings = [];
  let error;
  try {
    await connectDB();
    const docs = await Listing.find(buildListingQuery(searchParams))
      .select("-images")
      .sort(buildSort(searchParams.sort))
      .limit(60)
      .lean();
    listings = JSON.parse(JSON.stringify(docs));
  } catch (e) {
    error = e.message;
  }
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
          <Suspense fallback={null}><Filters count={listings.length} /></Suspense>
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
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-3 2xl:grid-cols-4">
              {listings.map((l) => <ListingCard key={l._id} l={l} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
