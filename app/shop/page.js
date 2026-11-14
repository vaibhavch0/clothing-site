import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { buildListingQuery, buildSort } from "@/lib/queries";
import ListingCard from "@/components/ListingCard";
import Filters from "@/components/Filters";
import DbNotice from "@/components/DbNotice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function Shop({ searchParams }) {
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

  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold sm:text-5xl">Shop</h1>
      <p className="mt-2 text-muted">{error ? "" : `${listings.length} item${listings.length === 1 ? "" : "s"} available`}</p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <Filters />
        </Suspense>
      </div>
      <div className="mt-8">
        {error ? (
          <DbNotice error={error} />
        ) : listings.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-display text-xl font-bold">Nothing matches those filters</p>
            <p className="mt-1 text-sm text-muted">Try loosening them or clearing everything.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => <ListingCard key={l._id} l={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
