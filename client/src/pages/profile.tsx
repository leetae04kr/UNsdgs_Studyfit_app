import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background">
      {/* Header */}
      <div className="gradient-bg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/')}
            className="w-10 h-10 p-0 rounded-full bg-white/20 text-white hover:bg-white/30"
            data-testid="back-button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-10 h-10 p-0 rounded-full bg-white/20 text-white hover:bg-white/30"
            data-testid="logout-button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </Button>
        </div>
        
        {/* Profile Info */}
        <div className="text-center">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
                data-testid="profile-image"
              />
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold" data-testid="user-name">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.email?.split('@')[0] || 'User'
            }
          </h2>
          <p className="text-white/80" data-testid="user-email">{user?.email || 'No email'}</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="p-4 -mt-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="token-gradient w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6L21 9ZM3 9L9 6V4L3 7V9ZM12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM21 11H3C3 12 4 13 5 13H19C20 13 21 12 21 11Z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold" data-testid="profile-tokens">{user?.tokens || 0}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="bg-accent w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold" data-testid="profile-exercises">{user?.totalExercises || 0}</div>
            <div className="text-sm text-muted-foreground">Exercises</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold" data-testid="profile-problems">{user?.totalProblems || 0}</div>
            <div className="text-sm text-muted-foreground">Problems</div>
          </Card>
          
          <Card className="p-4 text-center">
            <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold" data-testid="profile-streak">{user?.streak || 0}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
        </div>
        
        {/* Menu Items */}
        <div className="space-y-3">
          <Link href="/token-shop">
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Token Shop</span>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </div>
            </Card>
          </Link>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" data-testid="exercise-history-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 3C8.58 3 5 6.58 5 11H1L5.7 15.7C5.89 15.89 6.11 16 6.34 16S6.79 15.89 6.98 15.7L12 10.7V5H10V9.41L7.71 11.71C7.32 12.1 6.68 12.1 6.29 11.71S5.9 10.68 6.29 10.29L8.59 8H5C5 6.58 6.42 5 8 5V3H13Z"/>
                  </svg>
                </div>
                <span className="font-medium">Exercise History</span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" data-testid="problem-history-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <span className="font-medium">Problem History</span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" data-testid="invite-friends-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.015 3.015 0 0 0 16.93 6H15.5c-.8 0-1.53.5-1.83 1.25l-.68 2.01A2.25 2.25 0 0 1 11 7.5h-1c-1.1 0-2 .9-2 2s.9 2 2 2h1c.28 0 .5.22.5.5s-.22.5-.5.5H9c-1.1 0-2 .9-2 2s.9 2 2 2h2v6h2v-6h.5c1.93 0 3.5-1.57 3.5-3.5S15.43 9 13.5 9H13v-.5c0-.28.22-.5.5-.5h1.5z"/>
                  </svg>
                </div>
                <span className="font-medium">Invite Friends</span>
              </div>
              <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
