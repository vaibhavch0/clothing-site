import Link from "next/link";
import { BRAND, CATEGORIES, FREE_SHIPPING_MIN, SHIPPING_FEE, money } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-28 bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="display text-6xl sm:text-7xl">{BRAND}<span className="text-lime">.</span></p>
            <p className="mt-5 max-w-xs text-sm text-white/60">Hand-picked new clothing. Every piece is reviewed and priced by our team.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/shop" className="hover:text-lime">New in</Link></li>
              {CATEGORIES.slice(0, 5).map((c) => <li key={c}><Link href={`/shop?category=${c}`} className="hover:text-lime">{c}</Link></li>)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">More</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {["Vintage", "Streetwear", "Accessories"].map((c) => <li key={c}><Link href={`/shop?category=${c}`} className="hover:text-lime">{c}</Link></li>)}
              <li><Link href="/shop?sale=1" className="hover:text-lime">Sale</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Account</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/account" className="hover:text-lime">My orders</Link></li>
              <li><Link href="/wishlist" className="hover:text-lime">Wishlist</Link></li>
              <li><Link href="/login" className="hover:text-lime">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-lime">Create account</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>Shipping {money(SHIPPING_FEE)}, free over {money(FREE_SHIPPING_MIN)}.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
            <Link href="/privacy" className="hover:text-lime">Privacy</Link>
            <Link href="/terms" className="hover:text-lime">Terms</Link>
            <Link href="/returns" className="hover:text-lime">Returns</Link>
            <Link href="/contact" className="hover:text-lime">Contact</Link>
          </nav>
          <p>Test mode: no real payments are processed.</p>
        </div>
      </div>
    </footer>
  );
}
