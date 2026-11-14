"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./Providers";

export default function AuthForm({ mode }) {
  const signup = mode === "signup";
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  // signing up to sell lands on the seller dashboard
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { ok, data } = await api(`/api/auth/${mode}`, { method: "POST", body: f });
    setBusy(false);
    if (!ok) return setErr(data.error || "Something went wrong.");
    setUser(data.user);
    router.push(next === "/dashboard" ? (data.user.role === "admin" ? "/admin" : data.user.role === "seller" ? "/seller" : "/account") : next);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md py-16">
      <div className="card p-8 sm:p-10">
        <h1 className="display text-5xl">{signup ? "Join Styio" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted">{signup ? "Create a free account to shop." : "Log in to your account."}</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {signup && (
            <>
              <div><label className="label">Name</label>
                <input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            </>
          )}
          <div><label className="label">Email</label>
            <input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          {err && <p className="rounded-none bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          <button disabled={busy} className="btn btn-primary w-full py-3.5">{busy ? "…" : signup ? "Create account" : "Log in"}</button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          {signup ? "Already have an account?" : "New here?"}{" "}
          <Link href={signup ? `/login?next=${next}` : `/signup?next=${next}`} className="font-semibold text-ink underline underline-offset-4">
            {signup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}
