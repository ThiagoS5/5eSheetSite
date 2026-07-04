import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import "../public/fontawesome/css/fontawesome.css";
import "../public/fontawesome/css/solid.css";
import "../public/fontawesome/css/regular.css";
import "../public/fontawesome/css/brands.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forge & Fate",
  description: "Accessible character manager for D&D 5e.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} dark min-h-full scroll-smooth bg-slate-950 antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans text-foreground"
      >
        {children}
        <Toaster theme="dark" position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
