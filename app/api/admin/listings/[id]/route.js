import mongoose from "mongoose";
import { requireRole } from "@/lib/auth";
import { CATEGORIES, SIZES, CONDITIONS } from "@/lib/constants";
import Listing from "@/models/Listing";

// Admin edits any field, then optionally changes state with `action`:
// publish | reject | unpublish | markSold | relist
export async function PATCH(req, { params }) {
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
    if (b.condition !== undefined) { if (!CONDITIONS.includes(b.condition)) return Response.json({ error: "Bad condition" }, { status: 400 }); l.condition = b.condition; }
    if (b.price !== undefined) {
      const p = Number(b.price);
      if (!(p >= 1)) return Response.json({ error: "Price must be 1 or more." }, { status: 400 });
      l.price = p;
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

export async function DELETE(_req, { params }) {
  if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return Response.json({ error: "Not found" }, { status: 404 });
  await Listing.findByIdAndDelete(params.id);
  return Response.json({ ok: true });
}
