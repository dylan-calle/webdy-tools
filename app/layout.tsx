import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/layout/providers";
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
  title: "Webdy Tools — Developer Utilities",
  description:
    "A fast, open-source toolkit for developers. JSON formatter, Base64, BCrypt, JWT decoder, playground, and more.",
  keywords: ["developer tools", "json formatter", "base64", "bcrypt", "jwt", "playground", "devkit"],
  openGraph: {
    title: "Webdy Tools",
    description: "Open-source developer utilities",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <Providers>
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="grow overflow-auto">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
