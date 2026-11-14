export const isEmail = (s) => typeof s === "string" && s.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
export const MIN_PASSWORD = 8;
export const passwordOk = (s) => typeof s === "string" && s.length >= MIN_PASSWORD && s.length <= 100;
// Only real raster formats; SVG is rejected because it can carry scripts.
export const isSafeImage = (s) =>
  typeof s === "string" && s.length <= 1_500_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s);
