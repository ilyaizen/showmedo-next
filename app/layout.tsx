import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ShowMeDo",
  description:
    "A to-do list that suggests your next task, prioritizing what matters most",
  keywords: ["to-do", "task", "prioritize", "productivity"],
  openGraph: {
    title: "ShowMeDo",
    description:
      "A to-do list that suggests your next task, prioritizing what matters most",
    images: ["/og-image.png"],
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
