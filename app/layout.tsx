import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { ThemeScript } from "@/lib/theme/theme-script";
import { AuthProvider } from "@/components/auth";

export const metadata: Metadata = {
  title: "VNTV - Africa. Our Stories. Our Way.",
  description: "African news and video platform for digital journalism",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="system" storageKey="vntv-theme">
          <AuthProvider>
            {/* Skip to content link for accessibility */}
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
