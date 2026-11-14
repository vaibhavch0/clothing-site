import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { CATEGORIES, SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const now = new Date();
  const pages = ["", "/shop", "/privacy", "/terms", "/returns", "/contact"].map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now }));
  const cats = CATEGORIES.map((c) => ({ url: `${SITE_URL}/shop?category=${encodeURIComponent(c)}`, lastModified: now }));
  let items = [];
  try {
    await connectDB();
    const docs = await Listing.find({ status: "available" }).select("updatedAt").sort({ createdAt: -1 }).limit(1000).lean();
    items = docs.map((d) => ({ url: `${SITE_URL}/listing/${d._id}`, lastModified: d.updatedAt }));
  } catch {}
  return [...pages, ...cats, ...items];
}
