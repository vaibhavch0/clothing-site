import { connectDB } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import { shippingFor } from "@/lib/constants";
import { isLimited, hit, tooMany } from "@/lib/rateLimit";
import Listing from "@/models/Listing";
import Order from "@/models/Order";

// TEST MODE checkout: no real payment is taken and no card data is stored.
export async function POST(req) {
  const claimed = [];
  try {
    // Only customer accounts can buy. Role is re-read from the database, not the cookie.
    const s = await requireRole("customer");
    if (!s) {
      const who = await getSession();
      return who
        ? Response.json({ error: "Only customer accounts can place orders." }, { status: 403 })
        : Response.json({ error: "Please log in to check out." }, { status: 401 });
    }
    if (await isLimited(`order:${s.id}`, 30, 3600)) return tooMany();
    await hit(`order:${s.id}`, 3600);
    const { ids, shipping, card } = await req.json();
    if (!Array.isArray(ids) || !ids.length) return Response.json({ error: "Your cart is empty." }, { status: 400 });
    if (!shipping?.name || !shipping?.address || !shipping?.city || !shipping?.zip)
      return Response.json({ error: "Fill in your shipping details." }, { status: 400 });

    const num = String(card?.number || "").replace(/\s/g, "");
    if (num === "4000000000000002") return Response.json({ error: "Card declined (test card)." }, { status: 402 });
    if (num !== "4242424242424242")
      return Response.json({ error: "Test mode: use card 4242 4242 4242 4242." }, { status: 402 });

    await connectDB();
    const items = [];
    for (const id of ids) {
      const l = await Listing.findOneAndUpdate(
        { _id: id, status: "available", seller: { $ne: s.id } },
        { status: "sold" },
        { new: true }
      ).select("title price seller");
      if (!l) {
        await Listing.updateMany({ _id: { $in: claimed } }, { status: "available" });
        return Response.json({ error: "An item in your cart is no longer available." }, { status: 409 });
      }
      claimed.push(l._id);
      items.push({ listing: l._id, seller: l.seller, title: l.title, price: l.price });
    }
    const subtotal = items.reduce((a, i) => a + i.price, 0);
    const shippingFee = shippingFor(subtotal);
    const order = await Order.create({
      buyer: s.id,
      items,
      subtotal,
      shippingFee,
      total: +(subtotal + shippingFee).toFixed(2),
      shipping,
      paymentRef: "test_" + Math.random().toString(36).slice(2, 10),
    });
    return Response.json({ id: String(order._id) });
  } catch (e) {
    if (claimed.length) await Listing.updateMany({ _id: { $in: claimed } }, { status: "available" }).catch(() => {});
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const s = await getSession();
    if (!s) return Response.json({ error: "Not signed in" }, { status: 401 });
    await connectDB();
    const purchases = await Order.find({ buyer: s.id }).sort({ createdAt: -1 }).lean();
    const soldOrders = await Order.find({ "items.seller": s.id }).sort({ createdAt: -1 }).lean();
    const sales = soldOrders.map((o) => ({
      _id: o._id,
      createdAt: o.createdAt,
      shipping: o.shipping,
      items: o.items.filter((i) => String(i.seller) === s.id),
    }));
    return Response.json({ purchases, sales });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
