import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import User from "@/models/User";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const COOKIE = "styio_token";
const ROLES = ["customer", "seller", "admin"];
const normRole = (r) => (ROLES.includes(r) ? r : "customer");

export async function createSession(user) {
  const token = await new SignJWT({ id: String(user._id), name: user.name, role: normRole(user.role) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// Cheap JWT-only read (used for rendering). Never use this alone to authorise an action.
export async function getSession() {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: payload.id, name: payload.name, role: normRole(payload.role) };
  } catch {
    return null;
  }
}

// Authorisation check for APIs: re-reads the role from the database so that
// demoting a seller takes effect immediately, not when their cookie expires.
export async function requireRole(...roles) {
  const s = await getSession();
  if (!s) return null;
  await connectDB();
  const u = await User.findById(s.id).select("role name").lean();
  if (!u || !roles.includes(u.role)) return null;
  return { id: s.id, name: u.name, role: u.role };
}

export function clearSession() {
  cookies().delete(COOKIE);
}
