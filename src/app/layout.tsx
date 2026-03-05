import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/design-system.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskal - 明日の自分が助かるために",
  description: "個人生産性アプリ。タスク・案件・記事・人脈を一つに集約",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
