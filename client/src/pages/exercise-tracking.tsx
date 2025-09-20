import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExerciseCompleteModal } from "@/components/exercise-complete-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Exercise } from "@shared/schema";

export default function ExerciseTracking() {
  const { id: exerciseId } = useParams();
  const [, setLocation] = useLocation();
  const { user, userId } = useAuth();
  
  const [currentReps, setCurrentReps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [userExerciseId, setUserExerciseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Position yourself in front of the camera");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const { data: exercise, isLoading } = useQuery<Exercise>({
    queryKey: [`/api/exercises/${exerciseId}`],
    enabled: !!exerciseId,
  });

  const startExerciseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/exercises/start', {
        userId,
        exerciseId: exerciseId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setUserExerciseId(data.id);
      setIsTracking(true);
      startExerciseDetection();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start exercise. Please try again.",
        variant: "destructive"
      });
    },
  });

  const completeExerciseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/exercises/complete', {
        userId,
        userExerciseId,
        repsCompleted: currentReps,
        // tokensEarned is now computed server-side for security
      });
      return response.json();
    },
    onSuccess: () => {
      // Refresh user data to update token count
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user', userId] });
      setShowCompleteModal(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete exercise. Please try again.",
        variant: "destructive"
      });
    },
  });

  const startExerciseDetection = () => {
    // Show countdown before starting
    let countdownValue = 3;
    setCountdown(countdownValue);
    setFeedback("Get ready! Exercise starts in...");
    
    countdownIntervalRef.current = setInterval(() => {
      countdownValue--;
      setCountdown(countdownValue);
      
      if (countdownValue <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        setFeedback("Start exercising! Tap the screen when you complete a rep");
      }
    }, 1000);
  };
  
  const handleRepComplete = () => {
    if (!isTracking || isResting) return;
    
    const feedbackMessages = [
      "Great rep! Keep it up!",
      "Perfect form!",
      "Excellent! Stay focused!",
      "Nice work! Continue!",
      "You're doing amazing!",
    ];
    
    setCurrentReps(prev => {
      const newReps = prev + 1;
      const remaining = (exercise?.reps || 0) - newReps;
      
      if (newReps >= (exercise?.reps || 0)) {
        setFeedback("Exercise complete! Great job!");
        setTimeout(() => completeExerciseMutation.mutate(), 1000);
      } else {
        setFeedback(`${feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]} ${remaining} reps left!`);
        
        // Add rest period every 3 reps
        if (newReps % 3 === 0) {
          setIsResting(true);
          setFeedback("Take a 5 second rest...");
          restTimeoutRef.current = setTimeout(() => {
            setIsResting(false);
            setFeedback("Ready? Continue exercising!");
            restTimeoutRef.current = null;
          }, 5000);
        }
      }
      
      return newReps;
    });
  };

  const handleStartExercise = () => {
    startExerciseMutation.mutate();
  };
  
  const handleResetExercise = () => {
    // Clear all timers
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }
    
    setCurrentReps(0);
    setIsTracking(false);
    setIsResting(false);
    setCountdown(null);
    setFeedback("Position yourself in front of the camera");
    setUserExerciseId(null);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (restTimeoutRef.current) {
        clearTimeout(restTimeoutRef.current);
      }
    };
  }, []);

  const progressPercentage = exercise ? (currentReps / exercise.reps) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">Exercise not found</h2>
          <Button onClick={() => setLocation('/exercise-selection')}>
            Back to Exercises
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-gray-900 relative">
      {/* Exercise Area */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {countdown !== null ? (
              <div className="text-center">
                <div className="text-8xl font-bold text-white mb-4 animate-pulse" data-testid="countdown">
                  {countdown || "GO!"}
                </div>
                <p className="text-white text-xl">Get ready to start!</p>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
                  </svg>
                </div>
                <p className="text-white text-lg mb-8">
                  {isTracking ? (isResting ? "Take a rest..." : "Tap when you complete a rep!") : "Ready to start exercising?"}
                </p>
                {isTracking && (
                  <Button
                    onClick={handleRepComplete}
                    disabled={isResting}
                    className={`w-32 h-32 rounded-full text-2xl font-bold ${isResting ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600 animate-pulse'}`}
                    data-testid="rep-complete-button"
                  >
                    {isResting ? "Rest" : "REP!"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Exercise Stats Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="glass-effect rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800" data-testid="exercise-name">{exercise.name}</h2>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/exercise-selection')}
              className="w-8 h-8 p-0 rounded-full bg-gray-200"
              data-testid="close-exercise"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </Button>
          </div>
          
          {/* Counter */}
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-primary" data-testid="rep-count">{currentReps}</div>
            <div className="text-lg text-gray-600 font-semibold">/ {exercise.reps} reps</div>
            <div className="text-sm text-gray-500 mt-1">+{exercise.tokenReward} tokens reward</div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progressPercentage} className="mb-4 h-3" />
          <div className="text-xs text-gray-500 text-center mb-4">{Math.round(progressPercentage)}% complete</div>
          
          {/* Real-time Feedback */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <span className="text-yellow-800 text-sm font-medium" data-testid="exercise-feedback">{feedback}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exercise Guide */}
      <div className="absolute bottom-4 left-4 right-4">
        {!isTracking ? (
          <div className="glass-effect rounded-2xl p-4 space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-2">Exercise Instructions</h3>
              <div className="text-sm text-gray-600 space-y-1 mb-4 max-h-16 overflow-y-auto">
                {exercise.instructions?.map((instruction: string, index: number) => (
                  <div key={index}>• {instruction}</div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleStartExercise}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 font-semibold"
                disabled={startExerciseMutation.isPending}
                data-testid="start-tracking-button"
              >
                {startExerciseMutation.isPending ? "Starting..." : "🚀 Start Exercise"}
              </Button>
              <Button 
                onClick={() => setLocation('/exercise-selection')}
                variant="outline"
                className="px-6"
                data-testid="back-to-exercises"
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-2 text-center">Exercise Controls</h3>
            
            <div className="flex space-x-2 mb-3">
              <Button 
                onClick={handleResetExercise}
                variant="outline"
                className="flex-1 text-sm"
                data-testid="reset-exercise"
              >
                🔄 Reset
              </Button>
              <Button 
                onClick={() => setLocation('/exercise-selection')}
                variant="destructive"
                className="flex-1 text-sm"
                data-testid="stop-exercise"
              >
                ⏹️ Stop
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="font-semibold text-blue-600">{exercise.estimatedTime}</div>
                <div className="text-gray-500">Duration</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="font-semibold text-green-600">Level {exercise.difficulty}/3</div>
                <div className="text-gray-500">Difficulty</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="font-semibold text-yellow-600">+{exercise.tokenReward}</div>
                <div className="text-gray-500">Tokens</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ExerciseCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        exerciseName={exercise.name}
        tokensEarned={exercise.tokenReward}
        totalTokens={(user?.tokens || 0) + exercise.tokenReward}
        onViewSolutions={() => {
          setShowCompleteModal(false);
          setLocation('/solution-search');
        }}
        onBackToHome={() => {
          setShowCompleteModal(false);
          setLocation('/');
        }}
      />
    </div>
  );
}
