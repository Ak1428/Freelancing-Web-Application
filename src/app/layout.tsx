import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TalentFlow - Digital Marketplace",
  description: "Connect with skilled freelancers for your projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TopNav />
          <main className="min-h-screen bg-neutral-50">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
