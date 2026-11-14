"use client";
import Link from "next/link";

export default function Error({ reset }) {
  return (
    <div className="mx-auto my-24 max-w-md text-center">
      <h1 className="display text-5xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted">We hit a snag loading this page. Please try again in a moment.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn btn-primary !rounded-none px-8 py-4 uppercase tracking-wider">Try again</button>
        <Link href="/" className="btn btn-ghost !rounded-none px-8 py-4 uppercase tracking-wider">Home</Link>
      </div>
    </div>
  );
}
