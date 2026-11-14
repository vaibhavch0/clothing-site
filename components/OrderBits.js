// Small shared pieces for showing orders in every dashboard.

export function formatAddress(s = {}) {
  return [s.name, s.address, s.city, [s.state, s.zip].filter(Boolean).join(" "), s.country].filter(Boolean).join(", ");
}

export function TestOrderBanner({ forSeller = false }) {
  return (
    <p className="mb-3 border-l-4 border-sale bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
      TEST ORDER: no payment was received.{forSeller ? " Do not ship real goods." : ""}
    </p>
  );
}

// Human-friendly order number derived from the database id, e.g. #A1B2C3.
export const orderNo = (id) => `#${String(id).slice(-6).toUpperCase()}`;
