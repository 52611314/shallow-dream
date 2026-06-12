import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/components/layouts/root-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "浅梦写作助手 - Shallow Dream",
  description: "AI 驱动的文本生成工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}