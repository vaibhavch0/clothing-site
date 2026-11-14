import { requireRole } from "@/lib/auth";
import Listing from "@/models/Listing";
import User from "@/models/User";

export async function GET(req) {
  try {
    if (!(await requireRole("admin"))) return Response.json({ error: "Admin access only" }, { status: 403 });
    void User; // register model for populate
    const status = new URL(req.url).searchParams.get("status");
    const q = status ? { status } : {};
    const listings = await Listing.find(q)
      .select("-images")
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();
    return Response.json({ listings });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
