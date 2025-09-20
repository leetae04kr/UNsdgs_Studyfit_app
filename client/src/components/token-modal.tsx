import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTokens: number;
  currentTokens: number;
  onStartExercise: () => void;
  onGoToShop: () => void;
}

export function TokenModal({ 
  isOpen, 
  onClose, 
  requiredTokens, 
  currentTokens, 
  onStartExercise, 
  onGoToShop 
}: TokenModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" data-testid="modal-title">Insufficient Tokens!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            You need <span className="font-semibold" data-testid="required-tokens">{requiredTokens} tokens</span> to view this solution.<br/>
            You currently have <span className="font-semibold" data-testid="current-tokens">{currentTokens} tokens</span>.<br/>
            Complete exercise missions to earn more tokens!
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onStartExercise}
            className="w-full py-3 font-semibold bg-accent hover:bg-accent/90"
            data-testid="start-exercise-button"
          >
            Start Exercise Mission
          </Button>
          
          <Button 
            onClick={onGoToShop}
            variant="secondary"
            className="w-full py-3 font-semibold"
            data-testid="go-to-shop-button"
          >
            Go to Shop
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full py-3 font-medium"
            data-testid="cancel-button"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
