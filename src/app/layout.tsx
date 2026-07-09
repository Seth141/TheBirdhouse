import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/QueryProvider";
import { SkyBackground } from "@/components/background/SkyBackground";
import { ToastLayer } from "@/components/ui/ToastLayer";
import { PwaRegister } from "@/components/PwaRegister";
import { PasswordGate } from "@/components/auth/PasswordGate";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sara's Birdhouse",
  description:
    "A peaceful place to watch birds visit your backyard birdhouse — live camera, quiet moments, and gentle nature journaling.",
  applicationName: "Sara's Birdhouse",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/app-icon.png",
    apple: "/icons/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sara's Birdhouse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#EAF3F8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[#4F545A]">
        <QueryProvider>
          <PasswordGate>
            <div className="relative min-h-dvh w-full overflow-x-hidden">
              <SkyBackground />
              <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
                {children}
              </div>
            </div>
            <ToastLayer />
            <PwaRegister />
          </PasswordGate>
        </QueryProvider>
      </body>
    </html>
  );
}
