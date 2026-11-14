// ~750 KB per photo after base64; 4 photos stay well under Vercel's 4.5 MB request limit.
export const MAX_IMAGE_CHARS = 1_000_000;
export const cleanPhone = (s) => String(s || "").replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
export const isPhone = (s) => /^[6-9]\d{9}$/.test(cleanPhone(s));
export const isPin = (s) => /^[1-9]\d{5}$/.test(String(s || "").trim());
export const isEmail = (s) => typeof s === "string" && s.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
export const MIN_PASSWORD = 8;
export const passwordOk = (s) => typeof s === "string" && s.length >= MIN_PASSWORD && s.length <= 100;
// Only real raster formats; SVG is rejected because it can carry scripts.
export const isSafeImage = (s) =>
  typeof s === "string" && s.length <= MAX_IMAGE_CHARS && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s);
