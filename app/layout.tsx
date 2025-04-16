import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/lib/app-context"; // Add this import

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "unnamed-ai-app",
  description: "an unnamed ai app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            {/* Wrap children with AppProvider */}
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
