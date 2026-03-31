import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loyalty Club",
  description: "Dual-role loyalty network for businesses and members.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-roboto)]">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
