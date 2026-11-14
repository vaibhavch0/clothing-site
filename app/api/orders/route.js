import { connectDB } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import { shippingFor, INDIAN_STATES } from "@/lib/constants";
import { isLimited, hit, tooMany } from "@/lib/rateLimit";
import { cleanPhone, isPhone, isPin } from "@/lib/validate";
import Listing from "@/models/Listing";
import Order from "@/models/Order";

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

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
    const { ids, shipping: raw, card } = await req.json();
    if (!Array.isArray(ids) || !ids.length) return Response.json({ error: "Your bag is empty." }, { status: 400 });

    // Couriers need a reachable phone, a real PIN and the state.
    const shipping = {
      name: str(raw?.name, 80),
      phone: cleanPhone(raw?.phone),
      address: str(raw?.address, 300),
      city: str(raw?.city, 80),
      state: str(raw?.state, 60),
      zip: str(raw?.zip, 6),
      country: "India",
    };
    if (!shipping.name || !shipping.address || !shipping.city)
      return Response.json({ error: "Fill in your name, address and city." }, { status: 400 });
    if (!isPhone(shipping.phone)) return Response.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    if (!isPin(shipping.zip)) return Response.json({ error: "Enter a valid 6-digit PIN code." }, { status: 400 });
    if (!INDIAN_STATES.includes(shipping.state)) return Response.json({ error: "Choose your state." }, { status: 400 });

    const num = String(card?.number || "").replace(/\s/g, "");
    if (num === "4000000000000002") return Response.json({ error: "Card declined (test card)." }, { status: 402 });
    if (num !== "4242424242424242")
      return Response.json({ error: "Test mode: use card 4242 4242 4242 4242." }, { status: 402 });

    await connectDB();
    const uniqueIds = [...new Set(ids.map(String))];
    // Tell the shopper exactly which items are gone so the bag can drop them.
    const live = await Listing.find({ _id: { $in: uniqueIds }, status: "available" }).select("_id").lean();
    const liveSet = new Set(live.map((d) => String(d._id)));
    const gone = uniqueIds.filter((id) => !liveSet.has(id));
    if (gone.length)
      return Response.json({ error: "Some items in your bag just sold out. We've removed them.", unavailable: gone }, { status: 409 });

    const items = [];
    for (const id of uniqueIds) {
      const l = await Listing.findOneAndUpdate(
        { _id: id, status: "available", seller: { $ne: s.id } },
        { status: "sold" },
        { new: true }
      ).select("title price seller");
      if (!l) {
        await Listing.updateMany({ _id: { $in: claimed } }, { status: "available" });
        return Response.json({ error: "An item in your bag just sold out. We've removed it.", unavailable: [id] }, { status: 409 });
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
      testMode: true,
    });
    return Response.json({ id: String(order._id) });
  } catch (e) {
    if (claimed.length) await Listing.updateMany({ _id: { $in: claimed } }, { status: "available" }).catch(() => {});
    console.error("order error:", e.message);
    return Response.json({ error: "Something went wrong placing your order. You have not been charged." }, { status: 500 });
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
      testMode: o.testMode !== false,
      items: o.items.filter((i) => String(i.seller) === s.id),
    }));
    return Response.json({ purchases, sales });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
