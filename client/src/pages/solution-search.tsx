import { useQuery, useMutation } from "@tanstack/react-query";
import type { Solution } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenModal } from "@/components/token-modal";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SolutionSearch() {
  const [, setLocation] = useLocation();
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const { user, userId } = useAuth();
  const { toast } = useToast();

  const { data: solutions = [], isLoading } = useQuery<Solution[]>({
    queryKey: ['/api/solutions'],
  });

  const purchaseSolutionMutation = useMutation({
    mutationFn: async (solution: Solution) => {
      const currentProblemId = sessionStorage.getItem('currentProblemId');
      const response = await apiRequest('POST', '/api/solutions/purchase', {
        userId,
        solutionId: solution.id,
        problemId: currentProblemId
      });
      return response.json();
    },
    onSuccess: (data, solution) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user', userId] });
      sessionStorage.setItem('purchasedSolution', JSON.stringify(solution));
      setLocation('/solution-view');
      toast({
        title: "Solution Purchased!",
        description: `You spent ${solution.tokenCost} tokens to unlock this solution.`,
      });
    },
    onError: (error) => {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to purchase solution. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleViewSolution = (solution: Solution) => {
    if (!user || user.tokens < solution.tokenCost) {
      setSelectedSolution(solution);
      setShowTokenModal(true);
    } else {
      purchaseSolutionMutation.mutate(solution);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching for solutions...</p>
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
          onClick={() => setLocation('/ocr-result')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Search Results</h1>
        <div className="token-gradient px-3 py-1 rounded-full">
          <span className="text-white text-sm font-semibold" data-testid="header-token-count">{user?.tokens || 0}</span>
        </div>
      </div>
      
      {/* Search Results */}
      <div className="p-4 space-y-4">
        {solutions.map((solution) => (
          <Card key={solution.id} className="p-4 border border-border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">{solution.category}</Badge>
                <Badge className={`text-xs ${getDifficultyColor(solution.difficulty)}`}>
                  {solution.difficulty}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-green-600 text-sm font-medium" data-testid={`similarity-${solution.id}`}>
                  {solution.similarity}% match
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2" data-testid={`title-${solution.id}`}>{solution.title}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid={`description-${solution.id}`}>
              {solution.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
                </svg>
                <span className="font-semibold" data-testid={`token-cost-${solution.id}`}>{solution.tokenCost} tokens</span>
              </div>
              <Button 
                onClick={() => handleViewSolution(solution)}
                disabled={purchaseSolutionMutation.isPending}
                className="px-6 py-2 font-medium"
                data-testid={`view-solution-${solution.id}`}
              >
                {purchaseSolutionMutation.isPending ? "Purchasing..." : "View Solution"}
              </Button>
            </div>
          </Card>
        ))}

        {solutions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Solutions Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any matching solutions for your problem.
            </p>
            <Button onClick={() => setLocation('/camera')} variant="outline">
              Try Another Problem
            </Button>
          </div>
        )}
      </div>

      <TokenModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        requiredTokens={selectedSolution?.tokenCost || 0}
        currentTokens={user?.tokens || 0}
        onStartExercise={() => {
          setShowTokenModal(false);
          setLocation('/exercise-selection');
        }}
        onGoToShop={() => {
          setShowTokenModal(false);
          setLocation('/token-shop');
        }}
      />
    </div>
  );
}