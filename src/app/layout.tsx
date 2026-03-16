// src/app/layout.tsx
// Root layout with fonts, providers, and global structure

import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

// Display font — elegant editorial serif
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Body font — clean geometric sans
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://kenyafashionstore.co.ke"
  ),
  title: {
    default: "BNs Fashion Wear | Premium African Fashion",
    template: "%s | BNs Fashion Wear",
  },
  description:
    "Discover premium African-inspired fashion. Shop men's, women's and accessories with M-Pesa payment and fast delivery across Kenya.",
  keywords: [
    "fashion Kenya",
    "African fashion",
    "clothes Nairobi",
    "M-Pesa shopping",
    "online shopping Kenya",
    "African prints",
    "premium fashion",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "BNs Fashion Wear",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-cream font-body text-charcoal antialiased">
        <Providers>
          <Navbar />
          <CartSidebar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "font-body text-sm",
              style: {
                background: "#1C1C1C",
                color: "#FAF7F2",
                borderRadius: "4px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
