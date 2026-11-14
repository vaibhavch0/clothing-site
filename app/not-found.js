import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto my-24 max-w-md text-center">
      <p className="display text-8xl">404</p>
      <h1 className="display mt-2 text-3xl">Page not found</h1>
      <p className="mt-3 text-sm text-muted">The page you're looking for doesn't exist, or the piece has been taken down.</p>
      <Link href="/shop" className="btn btn-primary mt-6 !rounded-none px-8 py-4 uppercase tracking-wider">Back to shop</Link>
    </div>
  );
}
