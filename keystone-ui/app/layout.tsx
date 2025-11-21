import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const figtree = Figtree({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quntem KeyStone",
  description: "KeyStone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} antialiased`}><Suspense fallback={<div>Loading...</div>}>{children}</Suspense></body>
    </html>
  );
}
