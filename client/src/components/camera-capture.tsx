import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Tesseract from 'tesseract.js';

interface CameraCaptureProps {
  onImageCaptured: (imageData: string, ocrText: string) => void;
  isProcessing: boolean;
}

export function CameraCapture({ onImageCaptured, isProcessing }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsLoading(false);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Perform OCR on the captured image
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        logger: m => console.log(m) // Log OCR progress
      });

      stopCamera();
      onImageCaptured(imageData, text.trim());
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  if (error) {
    return (
      <div className="h-96 bg-gray-900 flex items-center justify-center text-center p-4">
        <div>
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p className="text-white mb-4">{error}</p>
          <Button onClick={startCamera} variant="secondary" data-testid="retry-camera">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Video Stream */}
      <div className="h-96 bg-gray-900 relative overflow-hidden">
        {stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              data-testid="camera-video"
            />
            {/* Camera Guidelines */}
            <div className="absolute inset-4 border-2 border-white/50 rounded-xl border-dashed pointer-events-none" />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white text-sm">Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={captureImage}
          disabled={!stream || isLoading || isProcessing}
          className="w-20 h-20 rounded-full bg-white shadow-2xl hover:bg-gray-50 text-primary"
          data-testid="capture-button"
        >
          {isLoading || isProcessing ? (
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
            </svg>
          )}
        </Button>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
