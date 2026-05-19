import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuya Ron's Store Rewards",
  description: "Store Points Rewards System for Kuya Ron's Store"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
