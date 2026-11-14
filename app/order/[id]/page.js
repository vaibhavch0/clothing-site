import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Order from "@/models/Order";
import { money } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const s = await getSession();
  if (!s || !mongoose.isValidObjectId(params.id)) notFound();
  await connectDB();
  const o = await Order.findOne({ _id: params.id, buyer: s.id }).lean();
  if (!o) notFound();
  return (
    <div className="mx-auto max-w-lg py-16">
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime text-2xl">✓</div>
        <h1 className="mt-5 text-3xl font-bold">Order confirmed</h1>
        <p className="mt-1 text-sm text-muted">Test payment ref {o.paymentRef}</p>
        <div className="mt-6 space-y-2 text-left text-sm">
          {o.items.map((i) => (
            <div key={String(i._id)} className="flex justify-between"><span>{i.title}</span><span>{money(i.price)}</span></div>
          ))}
          <div className="flex justify-between border-t border-line pt-2 text-muted"><span>Shipping</span><span>{money(o.shippingFee)}</span></div>
          <div className="flex justify-between font-display text-lg font-bold"><span>Total</span><span>{money(o.total)}</span></div>
        </div>
        <p className="mt-6 rounded-2xl bg-paper p-4 text-left text-sm text-muted">
          Shipping to {o.shipping.name}, {o.shipping.address}, {o.shipping.city} {o.shipping.zip}
        </p>
        <Link href="/shop" className="btn btn-primary mt-6">Keep shopping</Link>
      </div>
    </div>
  );
}
