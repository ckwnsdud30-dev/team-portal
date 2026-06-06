import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "팀 포털",
  description: "우리 팀만의 미니 포털사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#d2d2d7]/60 py-5 text-center text-xs text-[#86868b]">
          &copy; 2026 팀 포털
        </footer>
      </body>
    </html>
  );
}
