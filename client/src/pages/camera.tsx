import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/camera-capture";

export default function Camera() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCaptured = async (imageData: string, ocrText: string) => {
    setIsProcessing(true);
    
    // Store the captured data in sessionStorage for the next screen
    sessionStorage.setItem('capturedImage', imageData);
    sessionStorage.setItem('ocrText', ocrText);
    
    // Navigate to OCR result screen
    setLocation('/ocr-result');
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Capture Problem</h1>
        <div className="w-10"></div>
      </div>

      {/* Camera Section */}
      <div className="relative flex-1">
        <CameraCapture onImageCaptured={handleImageCaptured} isProcessing={isProcessing} />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-card">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Tips for better results:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Keep the text horizontal</li>
            <li>• Make sure the text is clear and readable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
