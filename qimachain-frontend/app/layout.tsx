import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "QīmaChain - AI-Powered Luxury Watch Valuations",
  description:
    "Upload photos. Receive a trusted on-chain valuation certificate.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} ${playfair.variable} bg-black text-white`}
      >
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
