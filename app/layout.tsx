import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Firalink Hub",
  description: "Firalink Hub Telegram Mini App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={${geistSans.variable} ${geistMono.variable} h-full antialiased}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}