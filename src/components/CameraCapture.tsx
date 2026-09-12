import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, X, AlertCircle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flash, setFlash] = useState<boolean>(false);

  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setErrorMessage(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser or device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsInitializing(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser settings or use photo upload instead.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No camera device found on this system. Please upload a photo from your files or select a demo fridge.");
      } else {
        setErrorMessage(`Could not access camera: ${err.message || "Unknown error"}. Please upload a photo instead.`);
      }
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Create canvas matching video aspect ratio
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Trigger visual flash
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

    // Stop camera and deliver base64
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onCapture(dataUrl);
  };

  return (
    <div id="camera-capture-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 text-stone-200">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Live Fridge Scanner</h3>
          </div>
          <button
            id="close-camera-button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {flash && <div className="absolute inset-0 bg-white z-20 transition-opacity duration-200" />}

          {isInitializing && (
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm">Connecting to camera sensor...</p>
            </div>
          )}

          {errorMessage && (
            <div className="max-w-md p-6 text-center text-stone-300 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-sm leading-relaxed">{errorMessage}</p>
              <button
                id="camera-error-cancel-button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition"
              >
                Return to Photo Upload
              </button>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${errorMessage || isInitializing ? "hidden" : "block"}`}
          />

          {/* Scanner Grid Overlay */}
          {!errorMessage && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/30 m-6 rounded-xl flex flex-col justify-between p-4">
              <div className="flex justify-between text-xs font-mono text-emerald-400/80 uppercase">
                <span>[ AI Scanning Bounds ]</span>
                <span>Auto-Focus Active</span>
              </div>
              <p className="text-center text-xs text-emerald-300 bg-stone-900/60 backdrop-blur-xs py-1 px-3 rounded-full mx-auto">
                Point at open fridge shelves and produce drawers
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-around px-6 py-5 bg-stone-950/80 border-t border-stone-800">
          <button
            id="switch-camera-mode-button"
            type="button"
            onClick={toggleCamera}
            disabled={!!errorMessage || isInitializing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-stone-300 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Flip ({facingMode === "environment" ? "Back" : "Front"})</span>
          </button>

          {/* Shutter Button */}
          <button
            id="shutter-capture-button"
            type="button"
            onClick={capturePhoto}
            disabled={!!errorMessage || isInitializing}
            className="relative flex items-center justify-center w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 transition shadow-lg shadow-emerald-500/30 cursor-pointer"
            title="Capture photo"
          >
            <div className="w-14 h-14 rounded-full border-2 border-stone-950 flex items-center justify-center">
              <Camera className="w-7 h-7 text-stone-950" />
            </div>
          </button>

          <button
            id="cancel-camera-button"
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 transition text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
