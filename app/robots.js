import { SITE_URL } from "@/lib/constants";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/seller", "/sell", "/account", "/cart", "/checkout", "/order/", "/dashboard"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
