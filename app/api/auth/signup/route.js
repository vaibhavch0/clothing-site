import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/auth";
import User from "@/models/User";

// Public sign-up always creates a customer. Sellers are created by the admin.
export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name?.trim() || !email?.includes("@") || (password || "").length < 6)
      return Response.json({ error: "Enter a name, valid email and a password of 6+ characters." }, { status: 400 });
    await connectDB();
    if (await User.findOne({ email: email.toLowerCase() }))
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role: "customer" });
    await createSession(user);
    return Response.json({ user: { id: String(user._id), name: user.name, role: "customer" } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
