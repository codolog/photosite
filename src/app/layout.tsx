import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const ptSans = PT_Sans({ weight: ["400", "700"], subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Экспедиции | Биологический отдел ДТЮ Ижевск",
  description: "История экспедиционного движения биологического отдела Дворца Творчества Юных города Ижевска",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={ptSans.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
          {children}
        </main>
        <footer className="border-t border-[var(--color-border)] py-4 text-center text-sm text-[var(--color-muted)]">
          Биологический отдел ДТЮ Ижевск · Экспедиционное движение
        </footer>
      </body>
    </html>
  );
}
