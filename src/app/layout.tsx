import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import Link from "next/link";
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
  title: "Novelrunner - Write Your Novel",
  description:
    "An opinionated, structured way to write your novel using AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <nav className="p-4">
            <Link href="/projects" className="mr-4">
              Projects
            </Link>
            <Link href="/login" className="mr-4">
              Login
            </Link>
            <Link href="/signup">Signup</Link>
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
