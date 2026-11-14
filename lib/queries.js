const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildListingQuery(sp = {}) {
  const q = { status: "available" };
  if (sp.q) {
    const re = new RegExp(escape(String(sp.q)), "i");
    q.$or = [{ title: re }, { brand: re }, { description: re }];
  }
  if (sp.category) q.category = sp.category;
  if (sp.size) q.size = sp.size;
  if (sp.condition) q.condition = sp.condition;
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
