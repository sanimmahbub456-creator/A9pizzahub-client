import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";
import type { Metadata } from "next";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PizzaHub | Hot & Fresh Pizza Delivered", template: "%s | PizzaHub" },
  description: "Discover local pizzerias, browse menus and order hot, fresh pizza for delivery with PizzaHub.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
