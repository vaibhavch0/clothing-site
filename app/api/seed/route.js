import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Listing from "@/models/Listing";

// Dev-only: visit /api/seed once to load demo listings.
const art = (a, b, accent) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="320" cy="90" r="60" fill="#fff" opacity=".12"/><g transform="translate(70 110) scale(2.2)"><path d="M30 20 L45 8 Q60 22 75 8 L90 20 L100 40 L86 46 L86 110 L34 110 L34 46 L20 40 Z" fill="${accent}" opacity=".95"/></g></svg>`
  );

const DEMO = [
  ["Oversized Boxy Tee", "Tops", "M", "Like new", 900, "Uniqlo", "#EDE7DA", "#CFC6B2", "#111"],
  ["Vintage Denim Jacket", "Outerwear", "L", "Good", 2700, "Levi's", "#9DB4CC", "#5F7E9F", "#2B4560"],
  ["Pleated Midi Skirt", "Bottoms", "S", "New with tags", 1600, "Zara", "#E8C9C0", "#D49D8F", "#7A3E34"],
  ["Cargo Utility Pants", "Streetwear", "M", "Good", 2050, "Dickies", "#9AA58A", "#6C7A5B", "#3F4A33"],
  ["Linen Summer Dress", "Dresses", "S", "Like new", 2300, "Mango", "#F3E3B3", "#E3C877", "#8A6D1A"],
  ["Chunky White Sneakers", "Shoes", "One size", "Good", 3100, "Nike", "#E9E9EE", "#C3C3CC", "#FFFFFF"],
  ["Retro Track Jacket", "Vintage", "M", "Fair", 1900, "Adidas", "#C9D6FF", "#7C93E8", "#1E2A78"],
  ["Cashmere Crew Sweater", "Tops", "M", "Like new", 4400, "COS", "#D9CBB8", "#B49F84", "#F1E8DA"],
  ["Wide-Leg Trousers", "Bottoms", "L", "New with tags", 2800, "H&M", "#CFCFCF", "#9B9B9B", "#222"],
  ["Puffer Vest", "Outerwear", "XL", "Good", 2450, "Patagonia", "#FFB48A", "#F26B38", "#7A2A0A"],
  ["Silk Slip Dress", "Dresses", "XS", "Like new", 3200, "Reformation", "#D8C2F0", "#A27ED6", "#4B2A80"],
  ["Canvas Tote", "Accessories", "One size", "New with tags", 700, "", "#F5E9B8", "#E0CC72", "#3B3200"],
];

export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Disabled", { status: 403 });
  try {
    await connectDB();
    if (await Listing.countDocuments()) return Response.json({ message: "Already seeded." });
    let seller = await User.findOne({ email: "demo@styio.test" });
    if (!seller)
      seller = await User.create({
        name: "Demo Seller",
        email: "demo@styio.test",
        passwordHash: await bcrypt.hash("demo1234", 10),
        role: "seller",
      });
    await Listing.insertMany(
      DEMO.map(([title, category, size, condition, price, brand, a, b, accent]) => ({
        seller: seller._id,
        title,
        category,
        size,
        condition,
        price,
        sellerPrice: Math.max(1, price - 200),
        status: "available",
        publishedAt: new Date(),
        brand,
        description: "Sample listing. Replace with your own pieces!",
        images: [art(a, b, accent)],
        imageCount: 1,
      }))
    );
    return Response.json({
      message: "Seeded 12 published listings. Demo seller: demo@styio.test / demo1234. Admin: log in with ADMIN_EMAIL / ADMIN_PASSWORD from .env.local.",
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
