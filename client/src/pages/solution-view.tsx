import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Solution } from "@shared/schema";

export default function SolutionView() {
  const [, setLocation] = useLocation();
  const [solution, setSolution] = useState<Solution | null>(null);

  useEffect(() => {
    // Get purchased solution from session storage
    const purchasedSolutionStr = sessionStorage.getItem('purchasedSolution');
    if (purchasedSolutionStr) {
      const purchasedSolution = JSON.parse(purchasedSolutionStr);
      setSolution(purchasedSolution);
    } else {
      // If no purchased solution, redirect back to solution search
      setLocation('/solution-search');
    }
  }, [setLocation]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!solution) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading solution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/solution-search')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Solution</h1>
        <div className="w-10"></div>
      </div>
      
      {/* Solution Content */}
      <div className="p-4 space-y-4">
        {/* Solution Header */}
        <Card className="p-4 border border-border">
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">{solution.category}</Badge>
              <Badge className={`text-xs ${getDifficultyColor(solution.difficulty)}`}>
                {solution.difficulty}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-green-600 text-sm font-medium">
                {solution.similarity}% match
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Cost: {solution.tokenCost} tokens
              </div>
            </div>
          </div>
          
          <h1 className="text-xl font-bold mb-2" data-testid="solution-title">{solution.title}</h1>
          <p className="text-muted-foreground mb-4" data-testid="solution-description">
            {solution.description}
          </p>
        </Card>

        {/* Detailed Solution */}
        <Card className="p-4 border border-border">
          <h2 className="text-lg font-semibold mb-4">Step-by-Step Solution</h2>
          <div 
            className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border"
            data-testid="solution-content"
          >
            {solution.content}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => setLocation('/camera')}
            className="w-full py-3 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            data-testid="capture-another-button"
          >
            📷 Capture Another Problem
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setLocation('/')}
              variant="outline"
              className="py-3 font-semibold"
              data-testid="home-button"
            >
              🏠 Home
            </Button>
            
            <Button 
              onClick={() => setLocation('/exercise-selection')}
              variant="outline"
              className="py-3 font-semibold"
              data-testid="exercises-button"
            >
              💪 Exercises
            </Button>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-green-600 font-semibold mb-2">✅ Solution Unlocked!</div>
          <p className="text-green-700 text-sm">
            You can now reference this solution anytime. Keep practicing to earn more tokens!
          </p>
        </div>
      </div>
    </div>
  );
}