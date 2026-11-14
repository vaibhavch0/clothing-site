export const BRAND = "Styio"; // placeholder name: change me
export const CURRENCY = "₹";
export const SHIPPING_FEE = 99;

export const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Vintage", "Streetwear"];
export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One size"];
export const CONDITIONS = ["New with tags", "Like new", "Good", "Fair"];

// Indian digit grouping, e.g. ₹1,299
export const money = (n) => `${CURRENCY}${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
