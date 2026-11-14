// Discount info for display. A listing is "on sale" when its MRP is higher than the selling price.
export function priceInfo(l) {
  const mrp = l.mrp && l.mrp > l.price ? l.mrp : null;
  const pct = mrp ? Math.round((1 - l.price / mrp) * 100) : 0;
  return { mrp, pct, save: mrp ? mrp - l.price : 0 };
}
