import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consultório - Gestão para PMEs",
  description:
    "Plataforma de gestão de consultórios, clínicas e escritórios profissionais. Marcações, pacientes, serviços e faturação num só sítio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans" suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
