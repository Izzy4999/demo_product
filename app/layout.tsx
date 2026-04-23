import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sproxil Sales Demo",
  description: "Interactive sales storytelling simulation for Sproxil products",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
