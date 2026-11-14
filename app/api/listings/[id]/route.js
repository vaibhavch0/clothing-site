import mongoose from "mongoose";
import { requireRole } from "@/lib/auth";
import Listing from "@/models/Listing";

// Sellers can only withdraw their own submissions that aren't live yet.
// Price/status changes are the admin's job (see /api/admin/listings).
export async function DELETE(_req, { params }) {
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Not found" }, { status: 404 });
  const s = await requireRole("seller");
  if (!s) return Response.json({ error: "Seller access only" }, { status: 403 });
  const r = await Listing.deleteOne({ _id: params.id, seller: s.id, status: { $in: ["pending", "rejected"] } });
  if (!r.deletedCount) return Response.json({ error: "Only pending or rejected submissions can be withdrawn." }, { status: 400 });
  return Response.json({ ok: true });
}
