const STEPS = [["paid", "Paid"], ["shipped", "Shipped"], ["delivered", "Delivered"]];

export default function OrderStatus({ status = "paid" }) {
  const idx = Math.max(0, STEPS.findIndex(([k]) => k === status));
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
      {STEPS.map(([k, label], i) => (
        <div key={k} className="flex items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 ${i <= idx ? "bg-lime text-ink" : "bg-paper text-muted"}`}>{label}</span>
          {i < STEPS.length - 1 && <span className={`h-px w-4 ${i < idx ? "bg-ink" : "bg-line"}`} />}
        </div>
      ))}
    </div>
  );
}
