import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/design-system.css";
import "./globals.css";
import PWARegister from "@/components/PWARegister/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskal - 明日の自分が助かるために",
  description: "個人生産性アプリ。タスク・案件・記事・人脈を一つに集約",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Taskal",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3fcf8e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.variable}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}

