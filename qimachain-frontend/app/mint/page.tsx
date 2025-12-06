"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Crown, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MintPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<
    "idle" | "waiting" | "processing" | "success"
  >("idle");

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setWalletConnected(true);
    setIsConnecting(false);
  };

  const mintCertificate = async () => {
    setIsMinting(true);
    setMintStatus("waiting");

    // Simulate transaction steps
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setMintStatus("processing");

    await new Promise((resolve) => setTimeout(resolve, 5000));
    setMintStatus("success");
    setIsMinting(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/QimaChainLogo.png"
                alt="QīmaChain"
                width={120}
                height={32}
                className="object-contain"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/evaluate"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Evaluate
              </Link>
              <Button variant="luxury" size="sm" className="text-xs px-4 py-2">
                {walletConnected ? "0x742d...8a9b" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair text-white">
              Mint Certificate
            </h1>
            <p className="text-sm text-gray-400">
              Tokenize your watch valuation on the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Certificate Preview */}
            <div className="space-y-8">
              <Card className="relative overflow-hidden border-2 border-yellow-400">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent" />
                <CardContent className="p-8 relative z-10">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="text-black" size={32} />
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                      QīmaChain Certificate
                    </div>
                    <div className="text-sm text-gray-400">
                      Blockchain Verified Valuation
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Watch Model</span>
                      <span className="text-white font-semibold">
                        Rolex Submariner 124060
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Estimated Value</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        $12,850
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confidence Score</span>
                      <span className="text-green-400 font-semibold">88%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Analysis Date</span>
                      <span className="text-white">Dec 6, 2025</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Certificate ID</span>
                      <span className="text-white font-mono text-xs">
                        QC-2025-1206-001
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-yellow-400/30">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">
                        VERIFIED BY
                      </div>
                      <div className="text-sm font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                        QīmaChain AI Oracle
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Token Standard</span>
                      <span className="text-white">ERC-721</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Blockchain</span>
                      <span className="text-white">Ethereum Mainnet</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Metadata Storage</span>
                      <span className="text-white">IPFS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Royalty Fee</span>
                      <span className="text-white">2.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Minting Interface */}
            <div className="space-y-8">
              {/* Wallet Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded mr-3" />
                    Wallet Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 rounded-lg p-4 mb-4 ${
                      walletConnected
                        ? "border-green-400 bg-green-400/10"
                        : "border-red-400 bg-red-400/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">
                          {walletConnected ? "Connected" : "Not Connected"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {walletConnected
                            ? "0x742d...8a9b"
                            : "Connect your wallet to mint certificate"}
                        </div>
                      </div>
                      {walletConnected ? (
                        <CheckCircle className="text-green-400 text-2xl" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-red-400 rounded-full" />
                      )}
                    </div>
                  </div>

                  {!walletConnected && (
                    <Button
                      onClick={connectWallet}
                      variant="luxury"
                      className="w-full"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 animate-spin" size={16} />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 bg-black rounded mr-2" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Minting Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Minting Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-200">
                        Certificate Name
                      </label>
                      <Input
                        value="Rolex Submariner 124060 Valuation"
                        className="bg-gray-800 border-gray-600"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-200">
                        Description
                      </label>
                      <Textarea
                        value="AI-powered valuation certificate for Rolex Submariner 124060 with 88% confidence score. Estimated value: $12,850 USD."
                        className="bg-gray-800 border-gray-600 h-24"
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-200">
                          Minting Fee
                        </label>
                        <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                          0.05 ETH
                        </div>
                        <div className="text-sm text-gray-400">≈ $125 USD</div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-200">
                          Gas Fee (Est.)
                        </label>
                        <div className="text-2xl font-bold text-white">
                          0.002 ETH
                        </div>
                        <div className="text-sm text-gray-400">≈ $5 USD</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mint Button */}
              <Card>
                <CardContent className="pt-6">
                  {mintStatus === "idle" && (
                    <Button
                      onClick={mintCertificate}
                      variant="luxury"
                      className="w-full text-lg py-4"
                      disabled={!walletConnected || isMinting}
                    >
                      <Crown className="mr-2" size={20} />
                      {walletConnected
                        ? "Mint Certificate"
                        : "Connect Wallet to Mint"}
                    </Button>
                  )}

                  {mintStatus === "waiting" && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Crown className="text-black" size={32} />
                      </div>
                      <div className="text-xl font-semibold mb-2">
                        Waiting for Transaction
                      </div>
                      <div className="text-gray-400 mb-4">
                        Please confirm the transaction in your wallet
                      </div>
                      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto animate-spin" />
                    </div>
                  )}

                  {mintStatus === "processing" && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="text-black" size={32} />
                      </div>
                      <div className="text-xl font-semibold mb-2">
                        Transaction Submitted
                      </div>
                      <div className="text-gray-400 mb-4">
                        Waiting for blockchain confirmation
                      </div>
                      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto animate-spin" />
                      <div className="mt-4 text-sm text-gray-500">
                        Transaction Hash: 0x7a8b...9c3d
                      </div>
                    </div>
                  )}

                  {mintStatus === "success" && (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-black" size={32} />
                      </div>
                      <div className="text-xl font-semibold mb-2 text-green-400">
                        Certificate Minted Successfully!
                      </div>
                      <div className="text-gray-400 mb-4">
                        Your certificate is now on the blockchain
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>Token ID: #2847</div>
                        <div>Block: #18,847,291</div>
                        <div>
                          <a
                            href="#"
                            className="text-yellow-400 hover:text-yellow-300 underline flex items-center justify-center"
                          >
                            View on Etherscan
                            <ExternalLink className="ml-1" size={14} />
                          </a>
                        </div>
                      </div>
                      <Link href="/dashboard" className="block mt-6">
                        <Button variant="luxury" className="w-full">
                          View in Dashboard
                        </Button>
                      </Link>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-400">
                      By minting, you agree to our terms of service and privacy
                      policy.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Textarea component for the mint page
const Textarea = ({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
