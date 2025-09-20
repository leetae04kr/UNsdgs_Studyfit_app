import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">StudyFit</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Token Counter */}
          <div className="token-gradient px-4 py-2 rounded-full flex items-center space-x-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
            </svg>
            <span className="text-white font-semibold" data-testid="token-count">{user?.tokens || 0}</span>
          </div>
          
          <Link href="/profile">
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0 rounded-full" data-testid="profile-button">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Message */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Capture problems or start exercising</p>
        </div>

        {/* Primary Action - Camera */}
        <Link href="/camera">
          <Card className="p-8 text-center cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-primary/30 hover:border-primary/50" data-testid="camera-card">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Capture Problem</h3>
            <p className="text-muted-foreground text-sm">Take a photo of your math problem</p>
          </Card>
        </Link>
        
        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/exercise-selection">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" data-testid="exercise-missions-card">
                <div className="w-12 h-12 mx-auto mb-2 bg-accent rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium">Exercise</p>
              </Card>
            </Link>
            
            <Link href="/token-shop">
              <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" data-testid="token-shop-card">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                  </svg>
                </div>
                <p className="text-sm font-medium">Shop</p>
              </Card>
            </Link>
            
            <Card className="p-4 text-center cursor-pointer hover:shadow-md transition-shadow" data-testid="history-card">
              <div className="w-12 h-12 mx-auto mb-2 bg-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3C8.58 3 5 6.58 5 11H1L5.7 15.7C5.89 15.89 6.11 16 6.34 16S6.79 15.89 6.98 15.7L12 10.7V5H10V9.41L7.71 11.71C7.32 12.1 6.68 12.1 6.29 11.71S5.9 10.68 6.29 10.29L8.59 8H5C5 6.58 6.42 5 8 5V3H13Z"/>
                </svg>
              </div>
              <p className="text-sm font-medium">History</p>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        {user && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="total-exercises">{user.totalExercises}</div>
                <div className="text-xs text-muted-foreground">Exercises</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent" data-testid="total-problems">{user.totalProblems}</div>
                <div className="text-xs text-muted-foreground">Problems</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600" data-testid="streak">{user.streak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
