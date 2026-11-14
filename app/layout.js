import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: `${BRAND}: curated clothing`,
  description: "Discover hand-picked new clothing.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#111111" };

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Archivo:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers initialUser={session ? { id: session.id, name: session.name, role: session.role } : null}>
          <Navbar />
          <main className="mx-auto min-h-[70vh] max-w-[1400px] px-4 sm:px-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
