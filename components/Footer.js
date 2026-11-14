import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted sm:flex-row sm:px-6">
        <p className="font-display text-lg font-bold text-ink">{BRAND.toLowerCase()}</p>
        <div className="flex gap-6">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <Link href="/account" className="hover:text-ink">My orders</Link>
        </div>
        <p>Test mode: no real payments are processed.</p>
      </div>
    </footer>
  );
}
