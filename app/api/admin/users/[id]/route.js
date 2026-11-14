import mongoose from "mongoose";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

// Promote a customer to seller, or remove seller access.
export async function PATCH(req, ctx) {
  const params = await ctx.params;
  try {
    const admin = await requireRole("admin");
    if (!admin) return Response.json({ error: "Admin access only" }, { status: 403 });
    const { role } = await req.json();
    if (!["customer", "seller"].includes(role) || !mongoose.isValidObjectId(params.id))
      return Response.json({ error: "Bad request" }, { status: 400 });
    const r = await User.updateOne({ _id: params.id, role: { $ne: "admin" } }, { role });
    if (!r.matchedCount) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
