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
          <nav className="sticky top-0 z-10 p-4 bg-white shadow-md w-full flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold text-gray-800">
              Novelrunner
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/projects"
                className="text-gray-700 hover:text-blue-500 font-medium"
              >
                Projects
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-500 font-medium"
              >
                Login
              </Link>
              <Link
                href="/private"
                className="text-gray-700 hover:text-blue-500 font-medium"
              >
                Profile
              </Link>
              <Link
                href="/signout"
                className="text-gray-700 hover:text-blue-500 font-medium"
              >
                Sign Out
              </Link>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
