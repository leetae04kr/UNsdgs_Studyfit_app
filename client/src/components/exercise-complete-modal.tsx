import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExerciseCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  tokensEarned: number;
  totalTokens: number;
  onViewSolutions: () => void;
  onBackToHome: () => void;
}

export function ExerciseCompleteModal({ 
  isOpen, 
  onClose, 
  exerciseName,
  tokensEarned,
  totalTokens,
  onViewSolutions, 
  onBackToHome 
}: ExerciseCompleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2" data-testid="success-title">Mission Complete!</h3>
          <p className="text-muted-foreground mb-6" data-testid="exercise-completion-message">
            Congratulations! You completed {exerciseName}!
          </p>
        </div>
        
        <div className="bg-muted rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
            </svg>
            <span className="text-2xl font-bold" data-testid="tokens-earned">+{tokensEarned}</span>
            <span className="text-muted-foreground">tokens</span>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="total-tokens">Total tokens: {totalTokens}</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onViewSolutions}
            className="w-full py-3 font-semibold"
            data-testid="view-solutions-button"
          >
            View Solutions
          </Button>
          
          <Button 
            onClick={onBackToHome}
            variant="secondary"
            className="w-full py-3 font-medium"
            data-testid="back-to-home-button"
          >
            Back to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
