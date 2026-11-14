import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { clientIp, isLimited, hit, tooMany } from "@/lib/rateLimit";
import { isEmail, passwordOk, MIN_PASSWORD } from "@/lib/validate";
import User from "@/models/User";

// Public sign-up always creates a customer. Sellers are created by the admin.
export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (typeof name !== "string" || !name.trim() || name.length > 60 || !isEmail(email) || !passwordOk(password))
      return Response.json({ error: `Enter your name, a valid email and a password of ${MIN_PASSWORD}+ characters.` }, { status: 400 });

    const key = `signup:ip:${await clientIp()}`;
    if (await isLimited(key, 10, 3600)) return tooMany();
    await hit(key, 3600);

    await connectDB();
    if (await User.findOne({ email: email.toLowerCase() }))
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 10), role: "customer" });
    await createSession(user);
    return Response.json({ user: { id: String(user._id), name: user.name, role: "customer" } });
  } catch (e) {
    console.error("signup error:", e.message);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
