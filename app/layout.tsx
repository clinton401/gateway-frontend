import type { Metadata } from "next";

import { Montserrat, Fira_Code } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { QueryProvider } from "@/components/layout/query-provider";
const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

// const fontSerif = Georgia({
//   subsets: ["latin"],
//   variable: "--font-serif",
// });

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gatewayos.vercel.app"),
  title: {
    default: "GatewayOS",
    template: "%s | GatewayOS",
  },
  description: "The programmable API gateway control plane for modern infrastructure.",
  keywords: ["API Gateway", "Proxy", "Infrastructure", "Developer Tools", "Control Plane"],
  authors: [{ name: "GatewayOS Team" }],
  creator: "GatewayOS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gatewayos.vercel.app",
    siteName: "GatewayOS",
    title: "GatewayOS",
    description: "The programmable API gateway control plane for modern infrastructure.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "GatewayOS Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GatewayOS",
    description: "The programmable API gateway control plane for modern infrastructure.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>

            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
