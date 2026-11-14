import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { PUBLIC_FIELDS } from "@/lib/queries";
import Listing from "@/models/Listing";

// Returns the current price/title for cart items that are still for sale.
// Anything missing from the response is sold, unpublished or deleted.
export async function POST(req) {
  try {
    const { ids } = await req.json();
    const valid = (Array.isArray(ids) ? ids : []).filter((id) => mongoose.isValidObjectId(id)).slice(0, 50);
    if (!valid.length) return Response.json({ items: [] });
    await connectDB();
    const docs = await Listing.find({ _id: { $in: valid }, status: "available" }).select(PUBLIC_FIELDS).lean();
    return Response.json({ items: docs.map((d) => ({ id: String(d._id), title: d.title, price: d.price })) });
  } catch {
    return Response.json({ error: "Couldn't check your bag right now." }, { status: 500 });
  }
}
