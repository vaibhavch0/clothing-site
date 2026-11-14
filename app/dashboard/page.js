import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Sends each person to the right dashboard for their account type.
export default async function Dashboard() {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard");
  redirect(s.role === "admin" ? "/admin" : s.role === "seller" ? "/seller" : "/account");
}
