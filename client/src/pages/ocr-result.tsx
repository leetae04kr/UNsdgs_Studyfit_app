import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function OcrResult() {
  const [, setLocation] = useLocation();
  const [ocrText, setOcrText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Get OCR text from session storage
    const savedOcrText = sessionStorage.getItem('ocrText');
    if (savedOcrText) {
      setOcrText(savedOcrText);
    } else {
      // If no OCR text, redirect back to camera
      setLocation('/camera');
    }
  }, [setLocation]);

  const handleSearch = () => {
    // Update session storage with edited text
    sessionStorage.setItem('ocrText', ocrText);
    setLocation('/solution-search');
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/camera')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Text Recognition Result</h1>
        <div className="w-10"></div>
      </div>
      
      {/* OCR Result */}
      <div className="p-4 space-y-4">
        <Card className="p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recognized Text</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              data-testid="edit-text-button"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Edit
            </Button>
          </div>
          
          {isEditing ? (
            <Textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Edit the recognized text..."
              data-testid="ocr-text-input"
            />
          ) : (
            <div className="bg-muted p-3 rounded-lg text-sm min-h-[100px] whitespace-pre-wrap" data-testid="ocr-text-display">
              {ocrText || "No text recognized. Try capturing the image again."}
            </div>
          )}
        </Card>
        
        <Button 
          onClick={handleSearch}
          className="w-full py-4 font-semibold"
          disabled={!ocrText.trim()}
          data-testid="search-solutions-button"
        >
          Search Similar Problems
        </Button>

        {/* Preview Image */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Captured Image</h3>
          <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Image preview would appear here</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
