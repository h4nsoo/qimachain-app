"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown, Upload, Brain, Award, ArrowRight, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "@/components/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/QimaChainLogo.png"
                alt="QīmaChain"
                width={120}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
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

      {/* Hero Section */}
      <section className="pt-40 pb-40 px-6 min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-10 font-playfair tracking-tight leading-tight">
              <span className="text-white block mb-2">
                AI-Powered Valuations
              </span>
              <span className="text-yellow-400">for Luxury Watches</span>
            </h1>
            <p className="text-base md:text-lg text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed">
              Upload photos. Receive a trusted on-chain valuation certificate.
              <br />
              Precision meets prestige in every assessment.
            </p>

            <div className="flex justify-center">
              <Link href="/evaluate">
                <Button
                  variant="luxury"
                  size="lg"
                  className="px-10 py-6 text-base font-medium"
                >
                  Evaluate My Watch
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Brands */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xs font-medium text-center mb-10 text-gray-500 uppercase tracking-widest">
            Supporting Premium Brands
          </h3>
          <div className="flex justify-center gap-20">
            {["ROLEX", "PATEK PHILIPPE"].map((brand) => (
              <div
                key={brand}
                className="text-lg font-medium text-gray-400 tracking-wider"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-20 text-white font-playfair">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="text-black" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Upload Photos
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Take detailed photos of your watch from multiple angles
                including the face, caseback, and papers.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="text-black" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Our advanced AI identifies the model, assesses condition, and
                analyzes market comparables.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-black" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Get Certificate
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
                Receive a blockchain-verified valuation certificate with
                detailed assessment report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/QimaChainLogo.png"
              alt="QīmaChain"
              width={120}
              height={32}
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-500">
            © 2025 QīmaChain. Precision meets prestige.
          </p>
        </div>
      </footer>
    </div>
  );
}
