import { requireRole } from "@/lib/auth";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET() {
  try {
    if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
    void User;
    const orders = await Order.find().populate("buyer", "name email").populate("items.seller", "name").sort({ createdAt: -1 }).limit(100).lean();
    return Response.json({ orders });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
