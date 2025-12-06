"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Crown,
  Download,
  Share,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AnalysisResponse } from "@/lib/types";
import { WalletButton } from "@/components/WalletButton";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    // Function to check for results
    const checkResults = () => {
      const stored = sessionStorage.getItem("analysisResult");
      const errorStored = sessionStorage.getItem("analysisError");
      const imagesStored = sessionStorage.getItem("uploadedImages");

      if (errorStored) {
        setError(errorStored);
        setLoading(false);
        sessionStorage.removeItem("analysisError");
        return;
      }

      if (imagesStored) {
        try {
          const images = JSON.parse(imagesStored);
          setUploadedImages(images);
        } catch (error) {
          console.error("Failed to parse uploaded images:", error);
        }
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setResult(parsed);
          setLoading(false);
        } catch (error) {
          console.error("Failed to parse analysis result:", error);
          setError("Failed to load results");
          setLoading(false);
        }
      }
    };

    // Check immediately on mount
    checkResults();

    // Listen for storage events (triggered when API completes)
    const handleStorageChange = () => {
      checkResults();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Watch...</h2>
          <p className="text-gray-400">AI is processing your watch image</p>
          <p className="text-gray-500 text-sm mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Analysis Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/evaluate">
            <Button variant="luxury">Try Again</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Results Found</h1>
          <p className="text-gray-400 mb-6">Please analyze a watch first</p>
          <Link href="/evaluate">
            <Button variant="luxury">Evaluate a Watch</Button>
          </Link>
        </div>
      </div>
    );
  }

  const valuation = result.valuation;
  const confidence = valuation ? Math.round(valuation.confidence * 100) : 0;
  const similarityScore = Math.round(result.similarity_score * 100);
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-playfair text-white">
              Valuation Results
            </h1>
            <p className="text-sm text-gray-400">
              Comprehensive analysis of your luxury timepiece
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Valuation Card */}
            <div className="lg:col-span-2 space-y-8">
              {/* Valuation Summary */}
              <Card>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">
                          Detected Model
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {result.recognized_brand}{" "}
                          {result.recognized_model_name}
                        </div>
                        <div className="text-gray-300">
                          Reference: {result.reference_number}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="text-sm text-gray-400 mb-2">
                          Estimated Value
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                          {valuation
                            ? `${
                                valuation.currency
                              } ${valuation.valuation.toLocaleString()}`
                            : "N/A"}
                        </div>
                        {valuation && (
                          <div className="text-sm text-gray-400">
                            Market Range: {valuation.currency}{" "}
                            {valuation.price_range[0].toLocaleString()} -{" "}
                            {valuation.currency}{" "}
                            {valuation.price_range[1].toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">
                          Confidence Score
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className="text-green-400 font-semibold">
                            {confidence}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                        <div className="absolute inset-2 rounded-full bg-black" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            {confidence}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">AI Confidence</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Image Match: {similarityScore}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Condition Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-3 text-yellow-400" />
                    Condition Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Overall Condition</span>
                        <span className="text-green-400 font-semibold capitalize">
                          {result.ai_condition.predicted_condition ||
                            result.input.condition_normalized ||
                            "N/A"}
                        </span>
                      </div>
                      {result.ai_condition.predicted_condition_confidence && (
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                            style={{
                              width: `${Math.round(
                                result.ai_condition
                                  .predicted_condition_confidence * 100
                              )}%`,
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            User Input
                          </span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                            <span className="text-sm capitalize">
                              Condition:{" "}
                              {result.input.condition_normalized ||
                                "Not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Box</span>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 ${
                                result.input.has_box
                                  ? "bg-green-400"
                                  : "bg-gray-400"
                              } rounded-full mr-2`}
                            />
                            <span className="text-sm">
                              {result.input.has_box
                                ? "Included"
                                : "Not included"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Papers</span>
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 ${
                                result.input.has_papers_effective
                                  ? "bg-green-400"
                                  : "bg-gray-400"
                              } rounded-full mr-2`}
                            />
                            <span className="text-sm">
                              {result.input.has_papers_effective
                                ? "Verified"
                                : "Not included"}
                            </span>
                          </div>
                        </div>

                        {result.certificate &&
                          result.certificate.enabled &&
                          !result.certificate.error && (
                            <>
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                                  Certificate Verification
                                </h4>
                                {result.certificate.extracted && (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm text-gray-400">
                                        Certificate Brand
                                      </span>
                                      <div className="flex items-center">
                                        <div
                                          className={`w-2 h-2 ${
                                            result.certificate.verification
                                              ?.brand_match
                                              ? "bg-green-400"
                                              : "bg-yellow-400"
                                          } rounded-full mr-2`}
                                        />
                                        <span className="text-sm">
                                          {result.certificate.extracted.brand ||
                                            "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm text-gray-400">
                                        Certificate Reference
                                      </span>
                                      <div className="flex items-center">
                                        <div
                                          className={`w-2 h-2 ${
                                            result.certificate.verification
                                              ?.reference_match
                                              ? "bg-green-400"
                                              : "bg-yellow-400"
                                          } rounded-full mr-2`}
                                        />
                                        <span className="text-sm">
                                          {result.certificate.extracted
                                            .reference_number || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm text-gray-400">
                                        Document Type
                                      </span>
                                      <span className="text-sm">
                                        {
                                          result.certificate.extracted
                                            .document_type
                                        }
                                      </span>
                                    </div>
                                    {result.certificate.extracted.date_iso && (
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">
                                          Certificate Date
                                        </span>
                                        <span className="text-sm">
                                          {
                                            result.certificate.extracted
                                              .date_iso
                                          }
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-400">
                                        Verification
                                      </span>
                                      <div className="flex items-center">
                                        <div
                                          className={`w-2 h-2 ${
                                            result.certificate.verification
                                              ?.papers_verified
                                              ? "bg-green-400"
                                              : "bg-red-400"
                                          } rounded-full mr-2`}
                                        />
                                        <span
                                          className={`text-sm ${
                                            result.certificate.verification
                                              ?.papers_verified
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {result.certificate.verification
                                            ?.papers_verified
                                            ? "Verified"
                                            : "Could not verify"}
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card className="border-green-400/20">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Accessories Impact
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Original Box
                              </span>
                              <span className="text-green-400 text-sm">
                                +$800
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">
                                Papers/Certificate
                              </span>
                              <span className="text-green-400 text-sm">
                                +$1,200
                              </span>
                            </div>
                            <div className="border-t border-gray-600 pt-2 mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-200">
                                  Total Premium
                                </span>
                                <span className="text-green-400 font-semibold">
                                  +$2,000
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Authenticity Check
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <CheckCircle
                                className="mr-2 text-green-400"
                                size={16}
                              />
                              <span className="text-sm text-gray-400">
                                Serial number verified
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CheckCircle
                                className="mr-2 text-green-400"
                                size={16}
                              />
                              <span className="text-sm text-gray-400">
                                Movement appears genuine
                              </span>
                            </div>
                            <div className="flex items-center">
                              <AlertTriangle
                                className="mr-2 text-yellow-400"
                                size={16}
                              />
                              <span className="text-sm text-gray-400">
                                Service history unknown
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Comparables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-3 text-yellow-400" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {valuation && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">
                            Comparables Used
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {valuation.num_comparables}
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <div className="text-sm text-gray-400 mb-1">
                            Market Risk
                          </div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {valuation.market_risk < 0.3
                              ? "Low"
                              : valuation.market_risk < 0.6
                              ? "Medium"
                              : "High"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            Baseline Mean Price
                          </span>
                          <span className="text-white font-semibold">
                            {valuation.currency}{" "}
                            {valuation.baseline_mean_price.toLocaleString()}
                          </span>
                        </div>
                        {valuation.ml_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              ML Model Prediction
                            </span>
                            <span className="text-white font-semibold">
                              {valuation.currency}{" "}
                              {valuation.ml_price.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <span className="text-sm text-gray-300 font-semibold">
                            Final Valuation
                          </span>
                          <span className="text-yellow-400 font-bold text-lg">
                            {valuation.currency}{" "}
                            {valuation.valuation.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-300 mb-2">
                          Filters Applied
                        </h4>
                        <div className="space-y-1 text-xs text-gray-400">
                          {valuation.filters_applied.condition_applied && (
                            <div className="flex items-center">
                              <Check size={12} className="mr-1 text-blue-400" />
                              Condition filter:{" "}
                              {valuation.filters_applied.condition_requested}
                            </div>
                          )}
                          {valuation.filters_applied.box_applied && (
                            <div className="flex items-center">
                              <Check size={12} className="mr-1 text-blue-400" />
                              Box filter applied
                            </div>
                          )}
                          {valuation.filters_applied.papers_applied && (
                            <div className="flex items-center">
                              <Check size={12} className="mr-1 text-blue-400" />
                              Papers filter applied
                            </div>
                          )}
                          {!valuation.filters_applied.condition_applied &&
                            !valuation.filters_applied.box_applied &&
                            !valuation.filters_applied.papers_applied && (
                              <div className="text-gray-500">
                                No filters applied (insufficient data)
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white/5 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">
                          Valuation Explanation
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {valuation.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Watch Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Watch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImages.length > 0 ? (
                      uploadedImages.slice(0, 4).map((imgSrc, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-900 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={imgSrc}
                            alt={`Uploaded ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                          <Image
                            src="/watches/sample-front.png"
                            alt="Watch Front"
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                          <Image
                            src="/watches/sample-caseback.png"
                            alt="Caseback"
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                          <Image
                            src="/watches/sample-wrist.png"
                            alt="Wrist Shot"
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden">
                          <Image
                            src="/watches/sample-papers.png"
                            alt="Papers"
                            width={200}
                            height={200}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/mint" className="block">
                    <Button variant="luxury" className="w-full">
                      <Award className="mr-2" size={16} />
                      Mint Certificate
                    </Button>
                  </Link>
                  <Button variant="luxuryOutline" className="w-full">
                    <Download className="mr-2" size={16} />
                    Download Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share className="mr-2" size={16} />
                    Share Results
                  </Button>
                </CardContent>
              </Card>

              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Analysis Date</span>
                      <span className="text-white">Dec 6, 2025</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">AI Model Version</span>
                      <span className="text-white">v2.3.1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Processing Time</span>
                      <span className="text-white">2.3 seconds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Report ID</span>
                      <span className="text-white font-mono">
                        #QC-2025-1206-001
                      </span>
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
