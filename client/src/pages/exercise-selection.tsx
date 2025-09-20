import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function ExerciseSelection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['/api/exercises'],
  });

  const getDifficultyDots = (difficulty: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < difficulty
            ? difficulty === 1 ? 'bg-green-500' 
              : difficulty === 2 ? 'bg-yellow-500'
              : 'bg-red-500'
            : 'bg-gray-300'
        }`}
      />
    ));
  };

  const startExercise = (exerciseId: string) => {
    setLocation(`/exercise-tracking/${exerciseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exercises...</p>
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
          onClick={() => setLocation('/')}
          className="w-10 h-10 p-0 rounded-full"
          data-testid="back-button"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold">Exercise Missions</h1>
        <div className="token-gradient px-3 py-1 rounded-full">
          <span className="text-white text-sm font-semibold" data-testid="header-token-count">{user?.tokens || 0}</span>
        </div>
      </div>
      
      {/* Exercise Missions */}
      <div className="p-4 space-y-4">
        {exercises.map((exercise: any) => (
          <Card key={exercise.id} className="p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold" data-testid={`exercise-name-${exercise.id}`}>{exercise.name}</h3>
                  <p className="text-muted-foreground text-sm" data-testid={`exercise-description-${exercise.id}`}>
                    {exercise.reps} reps completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="token-gradient px-3 py-1 rounded-full">
                  <span className="text-white font-semibold" data-testid={`exercise-reward-${exercise.id}`}>+{exercise.tokenReward}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">tokens</p>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Estimated time</span>
                <span className="font-medium" data-testid={`exercise-time-${exercise.id}`}>{exercise.estimatedTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Difficulty</span>
                <div className="flex space-x-1" data-testid={`exercise-difficulty-${exercise.id}`}>
                  {getDifficultyDots(exercise.difficulty)}
                </div>
              </div>
            </div>

            {/* Exercise Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {exercise.instructions.map((instruction: string, index: number) => (
                    <li key={index}>• {instruction}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={() => startExercise(exercise.id)}
              className="w-full py-3 font-semibold"
              data-testid={`start-exercise-${exercise.id}`}
            >
              Start Mission
            </Button>
          </Card>
        ))}

        {exercises.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
              </svg>
            </div>
            <h3 className="font-semibold mb-2">No exercises available</h3>
            <p className="text-muted-foreground text-sm">Check back later for new exercise missions.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
