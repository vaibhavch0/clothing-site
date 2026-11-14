import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Listing from "@/models/Listing";

export async function GET(_req, { params }) {
  try {
    if (!mongoose.isValidObjectId(params.id)) return new Response("Not found", { status: 404 });
    await connectDB();
    const l = await Listing.findById(params.id).select("images status seller").lean();
    if (!l) return new Response("Not found", { status: 404 });

    // Unpublished photos are visible only to the admin and the submitting seller.
    const live = l.status === "available" || l.status === "sold";
    if (!live) {
      const s = await getSession();
      if (!s || (s.role !== "admin" && String(l.seller) !== s.id)) return new Response("Not found", { status: 404 });
    }

    const src = l.images?.[Number(params.n)];
    // data:<mime>[;param...][;base64],<data>  (params such as ;utf8 or ;charset=utf-8 are allowed)
    const m = src?.match(/^data:([^;,]+)((?:;[^;,]*)*),(.*)$/s);
    if (!m) return new Response("Not found", { status: 404 });
    const body = /;base64/i.test(m[2]) ? Buffer.from(m[3], "base64") : Buffer.from(decodeURIComponent(m[3]));
    return new Response(body, {
      headers: { "Content-Type": m[1], "Cache-Control": live ? "public, max-age=86400" : "private, max-age=60" },
    });
  } catch {
    return new Response("Error", { status: 500 });
  }
}
