import type { Metadata } from "next";
import { Cal_Sans, Geist_Mono, Inter } from "next/font/google";
import { themeInitScript } from "@/components/theme/theme";
import "@puckeditor/core/puck.css";
import "./globals.css";
import "./editor.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const calSans = Cal_Sans({
  variable: "--font-cal-sans",
  subsets: ["latin"],
  weight: "400",
  adjustFontFallback: false,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Email Builder · Nautilus",
  description: "Compose, preview, schedule, and send emails to your members.",
  icons: { icon: "/nautilus-porthole.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${calSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full bg-white font-sans text-charcoal-800 antialiased dark:bg-neutral-950 dark:text-neutral-200">
        {children}
      </body>
    </html>
  );
}
