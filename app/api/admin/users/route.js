import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";
import Listing from "@/models/Listing";

export async function GET() {
  try {
    if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
    const users = await User.find({ role: { $ne: "admin" } }).select("name email role createdAt").sort({ createdAt: -1 }).lean();
    const counts = await Listing.aggregate([{ $group: { _id: "$seller", n: { $sum: 1 } } }]);
    const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    return Response.json({ users: users.map((u) => ({ ...u, products: byId[String(u._id)] || 0 })) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// Admin creates a seller account directly.
export async function POST(req) {
  try {
    if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.includes("@") || (password || "").length < 6)
      return Response.json({ error: "Enter a name, valid email and a password of 6+ characters." }, { status: 400 });
    if (await User.findOne({ email: email.toLowerCase() }))
      return Response.json({ error: "That email already has an account. Use \"Make seller\" on it instead." }, { status: 409 });
    const u = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role: "seller" });
    return Response.json({ id: String(u._id) });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
