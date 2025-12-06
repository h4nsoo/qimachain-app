"use client";

import { useState, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Camera,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analyzeWatch } from "@/lib/api";

interface UploadedFile {
  file: File;
  preview: string;
  quality: "good" | "poor" | "excellent";
  isPapers?: boolean;
}

export default function EvaluatePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    reference: "",
    year: "",
    condition: "",
    hasPapers: false,
    hasBox: false,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    photos?: string;
    required?: string;
  }>({});
  const router = useRouter();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    const newFiles = uploadedFiles.map((file) => {
      const fileName = file.name.toLowerCase();
      const isPapers =
        fileName.includes("paper") ||
        fileName.includes("certificate") ||
        fileName.includes("warranty");

      return {
        file,
        preview: URL.createObjectURL(file),
        quality: ["front", "caseback", "wrist"].some((term) =>
          fileName.includes(term)
        )
          ? ("excellent" as const)
          : ("good" as const),
        isPapers,
      };
    });
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (files.length === 0) {
      setErrors({ photos: "Please upload at least one photo of your watch" });
      return;
    }
    if (!formData.condition) {
      setErrors({ required: "Please select a condition" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the main watch image and papers image
      const watchImages = files.filter((f) => !f.isPapers);
      const papersImages = files.filter((f) => f.isPapers);

      if (watchImages.length === 0) {
        setErrors({
          photos: "Please upload at least one watch photo (not papers)",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare the API request
      const mainFile = watchImages[0].file;
      const papersFile =
        papersImages.length > 0 ? papersImages[0].file : undefined;

      // Normalize condition to backend format (e.g., "mint" -> "mint", "excellent" -> "excellent")
      const conditionMap: Record<string, string> = {
        mint: "mint",
        excellent: "excellent",
        good: "good",
        used: "used",
        "heavy-wear": "heavy_wear",
      };

      const normalizedCondition =
        conditionMap[formData.condition] || formData.condition;

      // Call the backend API
      const result = await analyzeWatch({
        file: mainFile,
        papers_file: papersFile,
        condition: normalizedCondition,
        has_box: formData.hasBox ? 1 : 0,
        has_papers: formData.hasPapers ? 1 : 0,
      });

      // Store result in sessionStorage for the results page
      sessionStorage.setItem("analysisResult", JSON.stringify(result));

      // Navigate to analysis page with animation
      router.push("/analysis");
    } catch (error) {
      console.error("Analysis failed:", error);
      setErrors({
        required:
          error instanceof Error
            ? error.message
            : "Failed to analyze watch. Please try again.",
      });
      setIsSubmitting(false);
    }
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
              <span className="text-white font-medium">Evaluate</span>
              <Button variant="luxury" size="sm" className="text-xs px-4 py-2">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair text-white">
              Evaluate Your Watch
            </h1>
            <p className="text-base text-gray-400 max-w-xl mx-auto">
              Upload detailed photos and information about your luxury timepiece
              for AI-powered valuation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Upload Watch Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errors.photos && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
                      <AlertCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p className="text-sm text-red-400">{errors.photos}</p>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-700 hover:border-yellow-400 rounded-lg p-10 text-center cursor-pointer transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload
                        className="mx-auto mb-4 text-yellow-400"
                        size={32}
                      />
                      <p className="text-sm font-medium mb-1 text-white">
                        Upload photos
                      </p>
                      <p className="text-xs text-gray-500">
                        Recommended: Front, caseback, wrist shot, papers
                      </p>
                    </label>
                  </div>

                  {/* Image Preview Grid */}
                  {files.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
                        >
                          <Image
                            src={file.preview}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/90 transition-colors"
                          >
                            <X size={16} />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                            {file.quality === "excellent" && (
                              <Check
                                className="mr-1 text-green-400"
                                size={12}
                              />
                            )}
                            {file.quality === "good" && (
                              <Check
                                className="mr-1 text-yellow-400"
                                size={12}
                              />
                            )}
                            {file.quality === "poor" && (
                              <AlertCircle
                                className="mr-1 text-red-400"
                                size={12}
                              />
                            )}
                            {file.quality}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">
                    Photo Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Use natural lighting when possible
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Capture clear, focused images
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Include serial numbers if visible
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      Show any wear or damage clearly
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Watch Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errors.required && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
                      <AlertCircle
                        className="text-red-400 flex-shrink-0 mt-0.5"
                        size={16}
                      />
                      <p className="text-sm text-red-400">{errors.required}</p>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Brand Selection */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Brand *
                      </label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) =>
                          setFormData({ ...formData, brand: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rolex">Rolex</SelectItem>
                          <SelectItem value="patek-philippe">
                            Patek Philippe
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model Line */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Model / Line
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Submariner, Royal Oak, Nautilus"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                      />
                    </div>

                    {/* Reference Number */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Reference Number
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., 124060, 5711/1A"
                        value={formData.reference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reference: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Year of Purchase */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Year of Purchase
                      </label>
                      <Input
                        type="number"
                        min="1900"
                        max="2025"
                        placeholder="e.g., 2021"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Condition *
                      </label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                          setFormData({ ...formData, condition: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mint">Mint - Like New</SelectItem>
                          <SelectItem value="excellent">
                            Excellent - Minor Wear
                          </SelectItem>
                          <SelectItem value="good">
                            Good - Normal Wear
                          </SelectItem>
                          <SelectItem value="used">
                            Used - Visible Wear
                          </SelectItem>
                          <SelectItem value="heavy-wear">Heavy Wear</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Papers and Box */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-white/[0.02]">
                        <label className="text-xs font-medium text-gray-400">
                          Has Papers?
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              hasPapers: !formData.hasPapers,
                            })
                          }
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            formData.hasPapers ? "bg-yellow-400" : "bg-gray-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                              formData.hasPapers
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-white/[0.02]">
                        <label className="text-xs font-medium text-gray-400">
                          Has Box?
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              hasBox: !formData.hasBox,
                            })
                          }
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            formData.hasBox ? "bg-yellow-400" : "bg-gray-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                              formData.hasBox
                                ? "translate-x-5"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-400">
                        Additional Notes
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any additional information about the watch..."
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.02] border border-white/5 text-white placeholder:text-gray-600 focus:border-yellow-400 focus:outline-none resize-none"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="luxury"
                      size="lg"
                      className="w-full py-6 mt-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze My Watch
                          <ArrowRight className="ml-2" size={16} />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
