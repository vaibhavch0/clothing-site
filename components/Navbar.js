"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth, useCart } from "./Providers";
import { BRAND } from "@/lib/constants";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          {BRAND.toLowerCase()}
          <span className="ml-0.5 inline-block h-2 w-2 rounded-full bg-lime ring-1 ring-ink" />
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link href="/shop" className="rounded-full px-4 py-2 hover:bg-black/5">Shop</Link>
          <Link href="/shop?category=Vintage" className="rounded-full px-4 py-2 hover:bg-black/5">Vintage</Link>
          <Link href="/shop?category=Streetwear" className="rounded-full px-4 py-2 hover:bg-black/5">Streetwear</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-black/5" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 12H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-[11px] font-bold ring-1 ring-ink">
                {items.length}
              </span>
            )}
          </Link>
          {user?.role === "seller" && <Link href="/sell" className="btn btn-lime hidden sm:inline-flex">+ Add product</Link>}
          {user?.role === "admin" && <Link href="/admin" className="btn btn-lime hidden sm:inline-flex">Admin</Link>}

          {user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                {user.name[0]?.toUpperCase()}
              </button>
              {open && (
                <div onClick={() => setOpen(false)} className="card absolute right-0 mt-2 w-48 overflow-hidden p-1.5 text-sm shadow-lift">
                  <div className="px-3 py-2 text-xs text-muted">Hi, {user.name}</div>
                  {user.role === "admin" && <Link href="/admin" className="block rounded-xl px-3 py-2 hover:bg-paper">Admin panel</Link>}
                  {user.role === "seller" && <Link href="/seller" className="block rounded-xl px-3 py-2 hover:bg-paper">Seller dashboard</Link>}
                  {user.role !== "admin" && <Link href="/account" className="block rounded-xl px-3 py-2 hover:bg-paper">My orders</Link>}
                  <button onClick={logout} className="block w-full rounded-xl px-3 py-2 text-left hover:bg-paper">Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-ghost">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
