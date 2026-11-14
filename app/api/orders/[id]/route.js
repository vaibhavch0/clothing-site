import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Order from "@/models/Order";

// Seller marks an item "shipped"; buyer confirms "delivered" once it has shipped.
export async function PATCH(req, ctx) {
  const params = await ctx.params;
  try {
    const s = await getSession();
    if (!s) return Response.json({ error: "Not signed in" }, { status: 401 });
    const { itemId, status } = await req.json();
    if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(itemId))
      return Response.json({ error: "Bad request" }, { status: 400 });
    await connectDB();
    const order = await Order.findById(params.id);
    const item = order?.items.id(itemId);
    if (!item) return Response.json({ error: "Not found" }, { status: 404 });

    if (status === "shipped" && String(item.seller) === s.id && item.status === "paid") item.status = "shipped";
    else if (status === "delivered" && String(order.buyer) === s.id && item.status === "shipped") item.status = "delivered";
    else return Response.json({ error: "That update isn't allowed." }, { status: 403 });

    await order.save();
    return Response.json({ ok: true, status: item.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
