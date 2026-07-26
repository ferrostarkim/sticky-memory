import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "クロスミッションキャンプ — 3D思い出ボード",
  description: "会瀬青少年の家で過ごすキャンプの思い出を、リアルタイムの3Dキャンプ場に残そう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
