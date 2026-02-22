import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arkan Core",
  description: "Core rebuilding",
};

export const viewport: Viewport = {
  themeColor: "#ffff00",
};

import { AudioInitializer } from "@/components/layout/AudioInitializer";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/app-shell";
import { TechnicalProtocolDialog } from "@/components/ui/technical-protocol-dialog";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <AudioInitializer />
        <AuthGuard>
          <AppShell>{children}</AppShell>
        </AuthGuard>
        <TechnicalProtocolDialog />
      </body>
    </html>
  );
}
