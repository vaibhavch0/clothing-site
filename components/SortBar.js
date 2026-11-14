"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { SortSelect } from "./Filters";

// Desktop sort control shown above the product grid.
export default function SortBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const set = (patch) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/shop?${p.toString()}`);
  };
  return <SortSelect sp={sp} set={set} />;
}
