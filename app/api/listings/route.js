import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { buildListingQuery, buildSort } from "@/lib/queries";
import { CATEGORIES, SIZES, CONDITIONS } from "@/lib/constants";
import Listing from "@/models/Listing";

// Public: only published ("available") items. Sellers can pass ?mine=1 to see their own submissions.
export async function GET(req) {
  try {
    const sp = Object.fromEntries(new URL(req.url).searchParams);
    let query = buildListingQuery(sp);
    if (sp.mine) {
      const s = await requireRole("seller");
      if (!s) return Response.json({ error: "Seller access only" }, { status: 403 });
      query = { seller: s.id };
    } else await connectDB();
    const listings = await Listing.find(query).select("-images").sort(buildSort(sp.sort)).limit(60).lean();
    return Response.json({ listings });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// Sellers submit products for admin review. Nothing goes live until the admin publishes it.
export async function POST(req) {
  try {
    const s = await requireRole("seller");
    if (!s) return Response.json({ error: "Only approved sellers can submit products." }, { status: 403 });
    const b = await req.json();
    const price = Number(b.price);
    if (!b.title?.trim()) return Response.json({ error: "Add a title." }, { status: 400 });
    if (!(price >= 1)) return Response.json({ error: "Enter your price (1 or more)." }, { status: 400 });
    if (!CATEGORIES.includes(b.category) || !SIZES.includes(b.size) || !CONDITIONS.includes(b.condition))
      return Response.json({ error: "Pick a category, size and condition." }, { status: 400 });
    const images = (b.images || []).slice(0, 4);
    if (!images.length) return Response.json({ error: "Add at least one photo." }, { status: 400 });
    if (images.some((i) => typeof i !== "string" || !i.startsWith("data:image/") || i.length > 1_500_000))
      return Response.json({ error: "One of the photos is invalid or too large." }, { status: 400 });
    const doc = await Listing.create({
      seller: s.id,
      title: b.title,
      description: b.description,
      brand: b.brand,
      category: b.category,
      size: b.size,
      condition: b.condition,
      sellerPrice: price,
      price,
      images,
      imageCount: images.length,
      status: "pending",
    });
    return Response.json({ id: String(doc._id) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
