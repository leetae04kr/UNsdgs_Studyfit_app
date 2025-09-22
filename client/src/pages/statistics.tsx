import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StatisticsData {
  user: {
    tokens: number;
    totalExercises: number;
    totalProblems: number;
    streak: number;
  };
  exerciseHistory: Array<{
    date: string;
    exercisesCompleted: number;
    tokensEarned: number;
  }>;
  tokenSpending: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  exerciseTypes: Array<{
    name: string;
    completed: number;
    tokensEarned: number;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function Statistics() {
  const [, setLocation] = useLocation();
  const { userId } = useAuth();

  const { data: stats, isLoading } = useQuery<StatisticsData>({
    queryKey: ['/api/statistics', userId],
    queryFn: async () => {
      const response = await fetch('/api/statistics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
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
        <h1 className="text-lg font-semibold">📊 My Statistics</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-2xl font-bold text-blue-700" data-testid="total-tokens">
              {stats?.user.tokens || 0}
            </div>
            <div className="text-sm text-blue-600">💰 Current Tokens</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-2xl font-bold text-green-700" data-testid="total-exercises">
              {stats?.user.totalExercises || 0}
            </div>
            <div className="text-sm text-green-600">💪 Exercises Done</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-2xl font-bold text-purple-700" data-testid="total-problems">
              {stats?.user.totalProblems || 0}
            </div>
            <div className="text-sm text-purple-600">📚 Problems Solved</div>
          </Card>
          
          <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="text-2xl font-bold text-orange-700" data-testid="streak-count">
              {stats?.user.streak || 0}
            </div>
            <div className="text-sm text-orange-600">🔥 Day Streak</div>
          </Card>
        </div>

        {/* Exercise Progress Chart */}
        {stats?.exerciseHistory && stats.exerciseHistory.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              📈 Exercise Progress
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.exerciseHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                    formatter={(value, name) => [
                      value,
                      name === 'exercisesCompleted' ? 'Exercises' : 'Tokens Earned'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exercisesCompleted" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokensEarned" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Token Spending Breakdown */}
        {stats?.tokenSpending && stats.tokenSpending.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              💸 Token Spending
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.tokenSpending}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {stats.tokenSpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Exercise Types Performance */}
        {stats?.exerciseTypes && stats.exerciseTypes.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center">
              🏋️ Exercise Performance
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.exerciseTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                  <Bar dataKey="tokensEarned" fill="#82ca9d" name="Tokens Earned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Motivational Message */}
        <Card className="p-4 text-center bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
          <div className="mb-2">
            {stats?.user.streak && stats.user.streak > 0 ? (
              <>
                <div className="text-lg font-semibold text-purple-700">
                  🎉 Amazing streak!
                </div>
                <div className="text-sm text-purple-600">
                  You've been consistent for {stats.user.streak} days. Keep it up!
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-purple-700">
                  💪 Ready to start?
                </div>
                <div className="text-sm text-purple-600">
                  Complete an exercise today to start your streak!
                </div>
              </>
            )}
          </div>
          <Button 
            onClick={() => setLocation('/exercise-selection')}
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            data-testid="start-exercise-button"
          >
            🚀 Start Exercise
          </Button>
        </Card>
      </div>
    </div>
  );
}