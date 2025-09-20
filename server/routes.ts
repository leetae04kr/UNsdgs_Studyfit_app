import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProblemSchema, insertUserExerciseSchema, insertUserSolutionSchema } from "@shared/schema";
import { db } from "./db";
import * as schema from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Problem routes
  app.post('/api/problems', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const problemData = insertProblemSchema.parse({ ...req.body, userId });
      const problem = await storage.createProblem(problemData);
      res.json(problem);
    } catch (error) {
      console.error("Error creating problem:", error);
      res.status(400).json({ message: "Failed to create problem" });
    }
  });

  app.get('/api/problems', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const problems = await storage.getUserProblems(userId);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  // Solution routes
  app.get('/api/solutions', async (req, res) => {
    try {
      const solutions = await storage.getAllSolutions();
      res.json(solutions);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      res.status(500).json({ message: "Failed to fetch solutions" });
    }
  });

  app.get('/api/solutions/:id', async (req, res) => {
    try {
      const solution = await storage.getSolution(req.params.id);
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }
      res.json(solution);
    } catch (error) {
      console.error("Error fetching solution:", error);
      res.status(500).json({ message: "Failed to fetch solution" });
    }
  });

  app.post('/api/solutions/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { solutionId, problemId } = req.body;
      
      const success = await storage.purchaseSolution(userId, solutionId, problemId);
      if (success) {
        const user = await storage.getUser(userId);
        res.json({ success: true, user });
      } else {
        res.status(400).json({ message: "Insufficient tokens or invalid solution" });
      }
    } catch (error) {
      console.error("Error purchasing solution:", error);
      res.status(500).json({ message: "Failed to purchase solution" });
    }
  });

  app.get('/api/user/solutions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const solutions = await storage.getUserSolutions(userId);
      res.json(solutions);
    } catch (error) {
      console.error("Error fetching user solutions:", error);
      res.status(500).json({ message: "Failed to fetch user solutions" });
    }
  });

  // Exercise routes
  app.get('/api/exercises', async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get('/api/exercises/:id', async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  app.post('/api/exercises/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { exerciseId } = req.body;
      
      const userExercise = await storage.createUserExercise({
        userId,
        exerciseId,
      });
      
      res.json(userExercise);
    } catch (error) {
      console.error("Error starting exercise:", error);
      res.status(500).json({ message: "Failed to start exercise" });
    }
  });

  app.post('/api/exercises/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userExerciseId, repsCompleted, tokensEarned } = req.body;
      
      const completedExercise = await storage.completeUserExercise(
        userExerciseId,
        repsCompleted,
        tokensEarned
      );
      
      // Update user tokens
      await storage.updateUserTokens(userId, tokensEarned);
      const user = await storage.getUser(userId);
      
      res.json({ exercise: completedExercise, user });
    } catch (error) {
      console.error("Error completing exercise:", error);
      res.status(500).json({ message: "Failed to complete exercise" });
    }
  });

  app.get('/api/user/exercises', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exercises = await storage.getUserExercises(userId);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching user exercises:", error);
      res.status(500).json({ message: "Failed to fetch user exercises" });
    }
  });

  // Seed data route (for development)
  app.post('/api/seed', async (req, res) => {
    try {
      // Seed solutions
      const solutions = [
        {
          title: "Quadratic Equation Solution",
          description: "Solving quadratic equations using factorization method",
          difficulty: "intermediate",
          tokenCost: 10,
          content: "To solve x² - 5x + 6 = 0, we factor: (x-2)(x-3) = 0, so x = 2 or x = 3",
          category: "algebra",
          similarity: 95,
        },
        {
          title: "Basic Quadratic Concepts",
          description: "Introduction to quadratic equations and the quadratic formula",
          difficulty: "beginner",
          tokenCost: 8,
          content: "Basic concepts and quadratic formula application",
          category: "algebra",
          similarity: 87,
        },
        {
          title: "Advanced Quadratic Methods",
          description: "Complex quadratic equations with multiple methods and graphical interpretation",
          difficulty: "advanced",
          tokenCost: 15,
          content: "Advanced methods including completing the square and graphical analysis",
          category: "algebra",
          similarity: 82,
        },
      ];

      // Seed exercises
      const exercises = [
        {
          name: "Push-ups",
          description: "10 reps completed",
          reps: 10,
          tokenReward: 10,
          difficulty: 1,
          estimatedTime: "2-3 minutes",
          instructions: ["Place hands shoulder-width apart", "Keep body in straight line", "Lower chest to floor"],
        },
        {
          name: "Squats",
          description: "15 reps completed",
          reps: 15,
          tokenReward: 15,
          difficulty: 2,
          estimatedTime: "3-4 minutes",
          instructions: ["Stand with feet shoulder-width apart", "Lower down as if sitting", "Keep knees behind toes"],
        },
        {
          name: "Jumping Jacks",
          description: "20 reps completed",
          reps: 20,
          tokenReward: 20,
          difficulty: 3,
          estimatedTime: "4-5 minutes",
          instructions: ["Start with feet together", "Jump while spreading legs", "Raise arms overhead"],
        },
      ];

      // Insert seed data
      for (const solution of solutions) {
        await db.insert(schema.solutions).values(solution);
      }

      for (const exercise of exercises) {
        await db.insert(schema.exercises).values(exercise);
      }

      res.json({ message: "Seed data inserted successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
