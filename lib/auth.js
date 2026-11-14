import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import User from "@/models/User";

// In production a missing/short JWT_SECRET must never fall back to a known value:
// we refuse to sign sessions and treat every cookie as logged out instead.
function secret() {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") return null;
  return new TextEncoder().encode("dev-secret-change-me");
}
const COOKIE = "styio_token";
const ROLES = ["customer", "seller", "admin"];
const normRole = (r) => (ROLES.includes(r) ? r : "customer");

export async function createSession(user) {
  const key = secret();
  if (!key) throw new Error("Server misconfigured: JWT_SECRET is missing.");
  const token = await new SignJWT({ id: String(user._id), name: user.name, role: normRole(user.role) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(key);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// Cheap JWT-only read (used for rendering). Never use this alone to authorise an action.
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  const key = secret();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
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

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}
