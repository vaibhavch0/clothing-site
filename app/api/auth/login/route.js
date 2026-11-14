import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { clientIp, isLimited, hit, tooMany } from "@/lib/rateLimit";
import User from "@/models/User";

const WINDOW = 15 * 60; // seconds

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const mail = (typeof email === "string" ? email : "").toLowerCase().trim();
    const ip = await clientIp();
    const acctKey = `login:acct:${mail}`;
    const ipKey = `login:ip:${ip}`;

    // Failed attempts are counted per account and per IP; block once either is used up.
    if ((await isLimited(acctKey, 8, WINDOW)) || (await isLimited(ipKey, 30, WINDOW))) return tooMany();

    await connectDB();
    let user = await User.findOne({ email: mail });

    // First-run bootstrap: create the admin from ADMIN_EMAIL / ADMIN_PASSWORD.
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!user && adminEmail && mail === adminEmail && password && password === process.env.ADMIN_PASSWORD) {
      user = await User.create({ name: "Admin", email: mail, passwordHash: await bcrypt.hash(password, 10), role: "admin" });
    }

    if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.passwordHash))) {
      await Promise.all([hit(acctKey, WINDOW), hit(ipKey, WINDOW)]);
      return Response.json({ error: "Wrong email or password." }, { status: 401 });
    }
    await createSession(user);
    return Response.json({ user: { id: String(user._id), name: user.name, role: user.role || "customer" } });
  } catch (e) {
    console.error("login error:", e.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
