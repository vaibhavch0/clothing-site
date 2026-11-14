import mongoose from "mongoose";
import { requireRole } from "@/lib/auth";
import { CATEGORIES, SIZES } from "@/lib/constants";
import Listing from "@/models/Listing";

// Admin edits any field, then optionally changes state with `action`:
// publish | reject | unpublish | markSold | relist
export async function PATCH(req, ctx) {
  const params = await ctx.params;
  try {
    if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
    if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Not found" }, { status: 404 });
    const b = await req.json();
    const l = await Listing.findById(params.id).select("-images");
    if (!l) return Response.json({ error: "Not found" }, { status: 404 });

    if (b.title !== undefined) { if (!b.title.trim()) return Response.json({ error: "Title can't be empty." }, { status: 400 }); l.title = b.title; }
    if (b.description !== undefined) l.description = b.description;
    if (b.brand !== undefined) l.brand = b.brand;
    if (b.category !== undefined) { if (!CATEGORIES.includes(b.category)) return Response.json({ error: "Bad category" }, { status: 400 }); l.category = b.category; }
    if (b.size !== undefined) { if (!SIZES.includes(b.size)) return Response.json({ error: "Bad size" }, { status: 400 }); l.size = b.size; }
    if (b.mrp !== undefined || b.discountPercent !== undefined) {
      const mrp = Number(b.mrp !== undefined ? b.mrp : l.mrp ?? l.price);
      const d = Number(b.discountPercent !== undefined ? b.discountPercent : l.discountPercent || 0);
      if (!(mrp >= 1) || mrp > 100000) return Response.json({ error: "Original price must be between 1 and 100000." }, { status: 400 });
      if (!(d >= 0 && d <= 90)) return Response.json({ error: "Discount must be between 0% and 90%." }, { status: 400 });
      l.mrp = mrp;
      l.discountPercent = d;
      l.price = Math.max(1, Math.round(mrp * (1 - d / 100))); // whole rupees
    } else if (b.price !== undefined) {
      const p = Number(b.price);
      if (!(p >= 1)) return Response.json({ error: "Price must be 1 or more." }, { status: 400 });
      l.price = p; l.mrp = p; l.discountPercent = 0; // plain price change clears any discount
    }
    if (b.adminNote !== undefined) l.adminNote = b.adminNote;

    switch (b.action) {
      case "publish": l.status = "available"; l.publishedAt = l.publishedAt || new Date(); l.adminNote = ""; break;
      case "reject": l.status = "rejected"; break;
      case "unpublish": l.status = "pending"; break;
      case "markSold": l.status = "sold"; break;
      case "relist": l.status = "available"; break;
      case undefined: break;
      default: return Response.json({ error: "Unknown action" }, { status: 400 });
    }
    await l.save();
    return Response.json({ ok: true, status: l.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req, ctx) {
  const params = await ctx.params;
  if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Not found" }, { status: 404 });
  await Listing.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}
