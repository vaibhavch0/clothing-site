export default function DbNotice({ error }) {
  return (
    <div className="card my-10 p-8 text-center">
      <p className="font-display text-xl font-bold">Database not connected yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Open <code className="rounded bg-paper px-1.5 py-0.5">.env.local</code>, replace{" "}
        <code className="rounded bg-paper px-1.5 py-0.5">YOUR_DB_USER</code> with your Atlas username, make sure your IP is
        allowed in Atlas → Network Access, then restart the dev server.
      </p>
      {error && <p className="mt-3 text-xs text-muted/80">{error}</p>}
    </div>
  );
}
