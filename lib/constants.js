export const BRAND = "Styio"; // placeholder name: change me
export const CURRENCY = "₹";
export const SHIPPING_FEE = 99;
export const FREE_SHIPPING_MIN = 1999;

export const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Vintage", "Streetwear"];
export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One size"];

// Indian digit grouping, e.g. ₹1,299
export const money = (n) => `${CURRENCY}${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Flat fee, free once the basket is big enough. Used by cart, checkout and the server.
export const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE);
export const shipLabel = (fee) => (fee ? money(fee) : "Free");

// ---- Business details shown on the legal pages. CHANGE THESE before going live. ----
export const BUSINESS_NAME = "Styio"; // your registered shop / company name
export const CONTACT_EMAIL = "support@yourdomain.com";
export const RETURN_DAYS = 7;
export const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
