"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Crown,
  CheckCircle,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/contexts/WalletContext";
import { WalletButton } from "@/components/WalletButton";
import { mintCertificate, getMintStatus } from "@/lib/api";
import type {
  AnalysisResponse,
  MintResponse,
  MintStatusResponse,
} from "@/lib/types";

export default function MintPage() {
  const { wallet, connectWallet, isConnecting } = useWallet();
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null
  );
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<
    "idle" | "waiting" | "processing" | "success" | "error"
  >("idle");
  const [certificateId, setCertificateId] = useState("");
  const [mintResult, setMintResult] = useState<MintResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceStatus, setServiceStatus] = useState<MintStatusResponse | null>(
    null
  );

  // Load analysis data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAnalysisData(data);
        // Generate certificate ID based on data
        const date = new Date();
        const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        setCertificateId(`QC-${dateStr}-${random}`);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
      }
    }
  }, []);

  // Check minting service status
  useEffect(() => {
    async function checkStatus() {
      const status = await getMintStatus();
      setServiceStatus(status);
    }
    checkStatus();
  }, []);

  const handleMintCertificate = async () => {
    if (!wallet?.isConnected || !analysisData || !analysisData.valuation)
      return;

    setIsMinting(true);
    setMintStatus("waiting");
    setErrorMessage("");

    try {
      // Get uploaded images from session storage (for IPFS upload)
      const uploadedImages = sessionStorage.getItem("uploadedImages");
      let imageBase64: string | undefined;

      if (uploadedImages) {
        try {
          const images = JSON.parse(uploadedImages);
          if (images.watch && images.watch.length > 0) {
            // Convert blob URL to base64
            const response = await fetch(images.watch);
            const blob = await response.blob();
            const reader = new FileReader();
            imageBase64 = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data:image/...;base64, prefix
                const base64Data = base64.split(",")[1];
                resolve(base64Data);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (err) {
          console.warn("Failed to load image for IPFS:", err);
        }
      }

      setMintStatus("processing");

      // Call minting API
      const result = await mintCertificate({
        wallet_address: wallet.address!,
        brand: analysisData.recognized_brand,
        model: analysisData.recognized_model_name,
        reference_number: analysisData.reference_number,
        valuation: analysisData.valuation,
        analysis_confidence: analysisData.similarity_score,
        certificate_data: analysisData.certificate?.extracted,
        image_base64: imageBase64,
      });

      setMintResult(result);
      setMintStatus("success");
    } catch (error: unknown) {
      console.error("Minting failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint certificate");
      setMintStatus("error");
    } finally {
      setIsMinting(false);
    }
  };

  // Calculate values
  const valuation = analysisData?.valuation;
  const confidence = valuation ? Math.round(valuation.confidence * 100) : 0;
  const watchModel = analysisData?.recognized_model_name || "Unknown Model";
  const brand = analysisData?.recognized_brand || "Unknown Brand";
  const reference = analysisData?.reference_number || "N/A";
  const estimatedValue = valuation?.valuation || 0;
  const analysisDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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
              <WalletButton />
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

          {!analysisData ? (
            <div className="text-center py-16">
              <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                No Analysis Data Found
              </h2>
              <p className="text-gray-400 mb-6">
                Please analyze a watch first before minting a certificate
              </p>
              <Link href="/evaluate">
                <Button variant="luxury">Evaluate a Watch</Button>
              </Link>
            </div>
          ) : (
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
                          {brand} {watchModel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Reference Number</span>
                        <span className="text-white font-semibold">
                          {reference}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Estimated Value</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                          ${estimatedValue.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Confidence Score</span>
                        <span className="text-green-400 font-semibold">
                          {confidence}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Analysis Date</span>
                        <span className="text-white">{analysisDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Certificate ID</span>
                        <span className="text-white font-mono text-xs">
                          {certificateId}
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
                        wallet?.isConnected
                          ? "border-green-400 bg-green-400/10"
                          : "border-red-400 bg-red-400/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">
                            {wallet?.isConnected
                              ? "Connected"
                              : "Not Connected"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {wallet?.isConnected && wallet?.address
                              ? `${wallet.address.slice(
                                  0,
                                  6
                                )}...${wallet.address.slice(-4)}`
                              : "Connect your wallet to mint certificate"}
                          </div>
                        </div>
                        {wallet?.isConnected ? (
                          <CheckCircle className="text-green-400 text-2xl" />
                        ) : (
                          <div className="w-6 h-6 border-2 border-red-400 rounded-full" />
                        )}
                      </div>
                    </div>

                    {!wallet?.isConnected && (
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
                          value={`${brand} ${watchModel} Valuation`}
                          className="bg-gray-800 border-gray-600"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-200">
                          Description
                        </label>
                        <Textarea
                          value={`AI-powered valuation certificate for ${brand} ${watchModel} (Ref: ${reference}) with ${confidence}% confidence score. Estimated value: $${estimatedValue.toLocaleString()} USD.`}
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
                          <div className="text-sm text-gray-400">
                            ≈ $125 USD
                          </div>
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
                    {/* Service Status Warning */}
                    {serviceStatus &&
                      !serviceStatus.ready_to_mint &&
                      mintStatus === "idle" && (
                        <div className="mb-4 p-4 border border-yellow-400 bg-yellow-400/10 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle
                              className="text-yellow-400 mr-2 mt-0.5"
                              size={20}
                            />
                            <div>
                              <div className="font-semibold text-yellow-400 mb-1">
                                Development Mode
                              </div>
                              <div className="text-sm text-gray-300">
                                {serviceStatus.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {mintStatus === "idle" && (
                      <Button
                        onClick={handleMintCertificate}
                        variant="luxury"
                        className="w-full text-lg py-4"
                        disabled={!wallet?.isConnected || isMinting}
                      >
                        <Crown className="mr-2" size={20} />
                        {wallet?.isConnected
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
                          Preparing Transaction
                        </div>
                        <div className="text-gray-400 mb-4">
                          Uploading metadata to IPFS...
                        </div>
                        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto animate-spin" />
                      </div>
                    )}

                    {mintStatus === "processing" && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Loader2
                            className="text-black animate-spin"
                            size={32}
                          />
                        </div>
                        <div className="text-xl font-semibold mb-2">
                          Transaction Submitted
                        </div>
                        <div className="text-gray-400 mb-4">
                          Waiting for blockchain confirmation...
                        </div>
                        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto animate-spin" />
                      </div>
                    )}

                    {mintStatus === "error" && (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="text-red-400" size={32} />
                        </div>
                        <div className="text-xl font-semibold mb-2 text-red-400">
                          Minting Failed
                        </div>
                        <div className="text-gray-400 mb-4 text-sm">
                          {errorMessage}
                        </div>
                        <Button
                          onClick={() => {
                            setMintStatus("idle");
                            setErrorMessage("");
                          }}
                          variant="luxury"
                          className="w-full"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {mintStatus === "success" && mintResult && (
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
                        <div className="space-y-3 text-sm mb-6">
                          {mintResult.token_id && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Token ID:</span>
                              <span className="font-mono">
                                #{mintResult.token_id}
                              </span>
                            </div>
                          )}
                          {mintResult.block_number && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Block:</span>
                              <span className="font-mono">
                                #{mintResult.block_number}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Tx Hash:</span>
                            <span className="font-mono text-xs">
                              {mintResult.transaction_hash.slice(0, 10)}...
                              {mintResult.transaction_hash.slice(-8)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {mintResult.explorer_url && (
                            <a
                              href={mintResult.explorer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button variant="outline" className="w-full">
                                View on Explorer
                                <ExternalLink className="ml-2" size={14} />
                              </Button>
                            </a>
                          )}
                          {mintResult.opensea_url && (
                            <a
                              href={mintResult.opensea_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button variant="outline" className="w-full">
                                View on OpenSea
                                <ExternalLink className="ml-2" size={14} />
                              </Button>
                            </a>
                          )}
                          {mintResult.metadata_uri && (
                            <a
                              href={mintResult.metadata_uri.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button variant="outline" className="w-full">
                                View Metadata (IPFS)
                                <ExternalLink className="ml-2" size={14} />
                              </Button>
                            </a>
                          )}
                          <Button
                            onClick={() => {
                              setMintStatus("idle");
                              setMintResult(null);
                            }}
                            variant="luxury"
                            className="w-full mt-4"
                          >
                            Mint Another Certificate
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <div className="text-sm text-gray-400">
                        By minting, you agree to our terms of service and
                        privacy policy.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
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
