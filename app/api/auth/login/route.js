import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createSession } from "@/lib/auth";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const mail = (email || "").toLowerCase().trim();
    await connectDB();
    let user = await User.findOne({ email: mail });

    // First-run bootstrap: create the admin from ADMIN_EMAIL / ADMIN_PASSWORD.
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!user && adminEmail && mail === adminEmail && password && password === process.env.ADMIN_PASSWORD) {
      user = await User.create({ name: "Admin", email: mail, passwordHash: await bcrypt.hash(password, 10), role: "admin" });
    }

    if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
      return Response.json({ error: "Wrong email or password." }, { status: 401 });
    await createSession(user);
    return Response.json({ user: { id: String(user._id), name: user.name, role: user.role || "customer" } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
