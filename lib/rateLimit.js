import { headers } from "next/headers";
import { connectDB } from "./db";
import RateLimit from "@/models/RateLimit";

// Fixed-window limiter stored in MongoDB, so it works across serverless instances.
const bucket = (key, windowSec) => `${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

// True when `key` has already used up `max` hits in the current window.
export async function isLimited(key, max, windowSec) {
  await connectDB();
  const r = await RateLimit.findOne({ key: bucket(key, windowSec) }).select("count").lean();
  return !!r && r.count >= max;
}

// Record one hit against `key`.
export async function hit(key, windowSec) {
  await connectDB();
  await RateLimit.updateOne(
    { key: bucket(key, windowSec) },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(Date.now() + windowSec * 2000) } },
    { upsert: true }
  );
}

export const tooMany = () =>
  Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
