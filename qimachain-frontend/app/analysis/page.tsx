"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Search,
  Eye,
  TrendingUp,
  Calculator,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AnalysisStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "completed";
}

export default function AnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const steps: AnalysisStep[] = [
    {
      id: 1,
      title: "Brand Identification",
      description: "Model & Reference",
      icon: <Search className="w-6 h-6" />,
      status: "active",
    },
    {
      id: 2,
      title: "Condition Assessment",
      description: "Wear & Damage",
      icon: <Eye className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: 3,
      title: "Market Analysis",
      description: "Comparable Sales",
      icon: <TrendingUp className="w-6 h-6" />,
      status: "pending",
    },
    {
      id: 4,
      title: "Valuation",
      description: "Final Estimate",
      icon: <Calculator className="w-6 h-6" />,
      status: "pending",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        // Navigate to results page
        router.push("/results");
      }, 500);
    }
  }, [progress, router]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [steps.length]);

  const getStepStatus = (stepIndex: number): AnalysisStep["status"] => {
    if (stepIndex < currentStep) return "completed";
    if (stepIndex === currentStep) return "active";
    return "pending";
  };

  const getStepIcon = (step: AnalysisStep, status: AnalysisStep["status"]) => {
    if (status === "completed") {
      return <Check className="w-6 h-6 text-black" />;
    }
    if (status === "active") {
      return <Loader2 className="w-6 h-6 text-black animate-spin" />;
    }
    return step.icon;
  };

  const getStepStyles = (status: AnalysisStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-400 border-green-400";
      case "active":
        return "bg-yellow-400 border-yellow-400";
      default:
        return "bg-gray-700 border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-16">
          <div className="mb-8">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Image
                src="/QimaChainLogo.png"
                alt="QīmaChain"
                width={150}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 font-playfair text-white">
              AI Analysis in Progress
            </h1>
            <p className="text-sm text-gray-400">
              Our advanced AI is carefully examining your timepiece
            </p>
          </div>
        </div>

        {/* Analysis Progress */}
        <Card className="mb-12 border-white/5">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Current Step */}
              <div className="text-center">
                <div className="text-xl font-semibold text-white mb-2">
                  {steps[currentStep]?.title || "Completing Analysis..."}
                </div>
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Analysis Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {steps.map((step, index) => {
                  const status = getStepStatus(index);
                  return (
                    <div
                      key={step.id}
                      className={`rounded-lg p-4 text-center border transition-all ${
                        status === "active"
                          ? "border-yellow-400 bg-yellow-400/5"
                          : status === "completed"
                          ? "border-green-400/30 bg-green-400/5"
                          : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 ${getStepStyles(
                          status
                        )}`}
                      >
                        {getStepIcon(step, status)}
                      </div>
                      <div className="text-xs font-medium text-white">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {step.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-1.5 text-gray-500">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            <div
              className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
            <span className="ml-2 text-xs">Processing your watch data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
