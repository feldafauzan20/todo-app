import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "To Do App",
  description:
    "A modern task management app built with Next.js, TypeScript, and Tailwind CSS to help organize daily activities with a clean pastel design.",
  keywords: [
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "To-Do App",
    "Task Manager",
    "Productivity",
  ],
  authors: [{ name: "Fauzan", url: "https://github.com/feldafauzan20" }],
  openGraph: {
    title: "To Do App",
    description: "A modern to-do list app, built with Next.js and TypeScript.",
    url: "https://your-todo-app.vercel.app", // ganti dengan link deploy kamu
    siteName: "To Do App",
    images: [
      {
        url: "https://your-todo-app.vercel.app/og-image.png", // nanti bisa bikin cover image custom
        width: 1200,
        height: 630,
        alt: "To Do App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "To Do App",
    description:
      "A clean and playful to-do list app with Next.js, TypeScript, and Tailwind CSS.",
    images: ["https://your-todo-app.vercel.app/og-image.png"], // sama kayak OG image
    creator: "@yourtwitter", // opsional
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
