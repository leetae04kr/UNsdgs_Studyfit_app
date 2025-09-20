import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExerciseCompleteModal } from "@/components/exercise-complete-modal";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function ExerciseTracking() {
  const { id: exerciseId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [currentReps, setCurrentReps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [userExerciseId, setUserExerciseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Position yourself in front of the camera");

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['/api/exercises', exerciseId],
    enabled: !!exerciseId,
  });

  const startExerciseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/exercises/start', {
        exerciseId: exerciseId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setUserExerciseId(data.id);
      setIsTracking(true);
      startExerciseDetection();
    },
  });

  const completeExerciseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/exercises/complete', {
        userExerciseId,
        repsCompleted: currentReps,
        tokensEarned: exercise?.tokenReward || 0,
      });
      return response.json();
    },
    onSuccess: () => {
      setShowCompleteModal(true);
    },
  });

  const startExerciseDetection = () => {
    // Simulate exercise detection
    const feedbackMessages = [
      "Keep your back straight!",
      "Great form!",
      "Lower down more",
      "Perfect! Keep going!",
      "Focus on your breathing",
    ];

    const detectionInterval = setInterval(() => {
      if (currentReps >= (exercise?.reps || 0)) {
        clearInterval(detectionInterval);
        completeExerciseMutation.mutate();
        return;
      }

      // Simulate rep detection (in real app, this would be pose detection)
      if (Math.random() > 0.3) { // 70% chance to increment rep
        setCurrentReps(prev => {
          const newReps = prev + 1;
          if (newReps >= (exercise?.reps || 0)) {
            clearInterval(detectionInterval);
            setTimeout(() => completeExerciseMutation.mutate(), 1000);
          }
          return newReps;
        });
      }

      // Update feedback
      setFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
    }, 2000);

    return () => clearInterval(detectionInterval);
  };

  const handleStartExercise = () => {
    startExerciseMutation.mutate();
  };

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
      {/* Camera Feed Simulation */}
      <div className="absolute inset-0 camera-overlay">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-white mb-4 opacity-50 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
            </svg>
            <p className="text-white text-sm opacity-75">
              {isTracking ? "Exercise in progress..." : "Position yourself in front of the camera"}
            </p>
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
            <div className="text-4xl font-bold text-primary" data-testid="rep-count">{currentReps}</div>
            <div className="text-sm text-gray-600">/ {exercise.reps} reps</div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progressPercentage} className="mb-4" />
          
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
          <div className="glass-effect rounded-2xl p-4 text-center">
            <h3 className="font-semibold text-gray-800 mb-3">Ready to start?</h3>
            <Button 
              onClick={handleStartExercise}
              className="w-full py-3 font-semibold"
              disabled={startExerciseMutation.isPending}
              data-testid="start-tracking-button"
            >
              {startExerciseMutation.isPending ? "Starting..." : "Start Exercise"}
            </Button>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Proper Form</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {exercise.instructions?.map((instruction: string, index: number) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
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
