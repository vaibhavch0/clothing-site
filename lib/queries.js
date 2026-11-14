export const PUBLIC_FIELDS = "title brand category size price mrp discountPercent imageCount status createdAt";
export const PUBLIC_DETAIL_FIELDS = PUBLIC_FIELDS + " description";
export const PAGE_SIZE = 24;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildListingQuery(sp = {}) {
  const q = { status: "available" };
  if (sp.q) {
    const re = new RegExp(escape(String(sp.q)), "i");
    q.$or = [{ title: re }, { brand: re }, { description: re }];
  }
  if (sp.category) q.category = sp.category;
  if (sp.size) q.size = sp.size;
  if (sp.sale) q.discountPercent = { $gt: 0 };
  if (sp.min || sp.max) {
    q.price = {};
    if (sp.min) q.price.$gte = Number(sp.min);
    if (sp.max) q.price.$lte = Number(sp.max);
  }
  return q;
}

export function buildSort(sort) {
  if (sort === "low") return { price: 1 };
  if (sort === "high") return { price: -1 };
  return { createdAt: -1 };
}
