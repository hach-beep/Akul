import React, { useState, useRef } from "react";
import { Camera, Upload, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { SAMPLE_FRIDGES, SampleFridge } from "../data/sampleFridges.ts";

interface ImageUploaderProps {
  selectedImage: string | null;
  onImageSelected: (dataUrl: string) => void;
  onClearImage: () => void;
  onOpenLiveCamera: () => void;
  isAnalyzing: boolean;
  onStartAnalysis: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  onImageSelected,
  onClearImage,
  onOpenLiveCamera,
  isAnalyzing,
  onStartAnalysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectSample = (sample: SampleFridge) => {
    onImageSelected(sample.imageDataUrl);
  };

  return (
    <div id="fridge-image-uploader-section" className="w-full space-y-4">
      {/* If an image is selected */}
      {selectedImage ? (
        <div className="relative bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image Preview */}
            <div className="relative w-full md:w-80 h-56 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shrink-0">
              <img
                src={selectedImage}
                alt="Selected Fridge Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-stone-900/80 backdrop-blur-xs rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for AI Scan</span>
              </div>
            </div>

            {/* Actions & Instructions */}
            <div className="flex-1 space-y-4 text-left w-full">
              <div>
                <h3 className="text-xl font-bold font-display text-stone-900">
                  Fridge Photo Captured
                </h3>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                  The AI Agent will inspect every shelf, identify produce freshness, detect dairy and proteins, and recommend custom meals with grocery delivery options for missing items.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="start-fridge-analysis-button"
                  type="button"
                  onClick={onStartAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isAnalyzing ? "Scanning Fridge with Gemini AI..." : "Analyze Fridge & Suggest Meals"}</span>
                </button>

                <button
                  id="change-photo-button"
                  type="button"
                  onClick={onClearImage}
                  disabled={isAnalyzing}
                  className="px-4 py-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  <span>Retake / Change Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Upload & Sample Selector Area */
        <div className="space-y-6">
          {/* Main Dropzone / Camera Card */}
          <div
            id="fridge-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                : "border-stone-300 bg-white hover:border-stone-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <Camera className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-semibold font-display text-stone-900">
                  Snap or Upload Your Fridge
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  Take a photo with your phone/webcam or drag & drop an image here
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="open-live-camera-button"
                  type="button"
                  onClick={onOpenLiveCamera}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Live Photo</span>
                </button>

                <button
                  id="browse-files-button"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Upload from Device</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Fridge Presets */}
          <div className="bg-stone-100/80 rounded-2xl p-5 border border-stone-200/80 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700">
                  Instant Test: Choose a Demo Fridge
                </h4>
              </div>
              <span className="text-xs text-stone-500">1-click simulation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_FRIDGES.map((sample) => (
                <button
                  key={sample.id}
                  id={`demo-fridge-${sample.id}`}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="group p-3.5 bg-white hover:border-emerald-500 border border-stone-200 rounded-xl text-left transition shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-stone-900 text-sm group-hover:text-emerald-700 transition">
                        {sample.name}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {sample.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                    <span className="truncate">{sample.itemsSummary}</span>
                    <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition">Select →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
