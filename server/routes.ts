import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProblemSchema, insertUserExerciseSchema, insertUserSolutionSchema } from "@shared/schema";
import { z } from "zod";

// Request validation schemas
const completeExerciseSchema = z.object({
  userExerciseId: z.string().uuid(),
  repsCompleted: z.number().int().min(0),
});

const shopPurchaseSchema = z.object({
  itemId: z.string(),
});

const solutionPurchaseSchema = z.object({
  solutionId: z.string().uuid(),
  problemId: z.string().uuid().optional(),
});
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

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
      // Remove content from public listings for security
      const publicSolutions = solutions.map(solution => ({
        ...solution,
        content: undefined // Hide content from public API
      }));
      res.json(publicSolutions);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      res.status(500).json({ message: "Failed to fetch solutions" });
    }
  });

  app.get('/api/solutions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const solutionId = req.params.id;
      
      // Check if user owns this solution
      const userSolutions = await storage.getUserSolutions(userId);
      const ownsSolution = userSolutions.some((solution: any) => solution.id === solutionId);
      
      if (!ownsSolution) {
        return res.status(403).json({ message: "Access denied. Purchase solution first." });
      }
      
      const solution = await storage.getSolution(solutionId);
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
      
      // Validate request body
      const validationResult = solutionPurchaseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { solutionId, problemId } = validationResult.data;
      
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
      
      // Validate request body
      const validationResult = completeExerciseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { userExerciseId, repsCompleted } = validationResult.data;
      
      // SECURE: Compute tokens server-side with concurrency protection
      const result = await db.transaction(async (tx) => {
        // Atomically mark exercise as completed to prevent race conditions
        const completionResult = await tx
          .update(schema.userExercises)
          .set({
            completed: true,
            repsCompleted,
            completedAt: new Date(),
          })
          .where(
            and(
              eq(schema.userExercises.id, userExerciseId),
              eq(schema.userExercises.userId, userId),
              eq(schema.userExercises.completed, false) // Only update if not already completed
            )
          )
          .returning();

        if (!completionResult[0]) {
          throw new Error("Exercise not found, already completed, or access denied");
        }

        // Get the exercise to determine token reward
        const exercise = await tx
          .select()
          .from(schema.exercises)
          .where(eq(schema.exercises.id, completionResult[0].exerciseId))
          .limit(1);

        if (!exercise[0]) {
          throw new Error("Exercise not found");
        }

        const tokensEarned = exercise[0].tokenReward; // Server-computed tokens

        // Update the completed user exercise with tokens earned
        await tx
          .update(schema.userExercises)
          .set({
            tokensEarned,
          })
          .where(eq(schema.userExercises.id, userExerciseId));

        // Update user tokens atomically
        await tx
          .update(schema.users)
          .set({
            tokens: sql`${schema.users.tokens} + ${tokensEarned}`,
            totalExercises: sql`${schema.users.totalExercises} + 1`,
          })
          .where(eq(schema.users.id, userId));

        return { tokensEarned, exercise: completionResult[0] };
      });

      const user = await storage.getUser(userId);
      res.json({ exercise: result.exercise, tokensEarned: result.tokensEarned, user });
    } catch (error: any) {
      console.error("Error completing exercise:", error);
      if (error.message.includes("already completed")) {
        res.status(409).json({ message: error.message });
      } else if (error.message.includes("access denied")) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to complete exercise" });
      }
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
  // Server-side shop catalog for security
  const SHOP_CATALOG = {
    "1": { title: "Premium Solutions", tokenCost: 50, description: "Detailed step-by-step explanations" },
    "2": { title: "Avatar Skin", tokenCost: 30, description: "Astronaut theme" },
    "3": { title: "Study Theme", tokenCost: 20, description: "Dark mode theme" },
    "4": { title: "Special Exercises", tokenCost: 40, description: "Yoga & Stretching" }
  };

  // Get shop catalog endpoint
  app.get("/api/shop/catalog", async (req, res) => {
    res.json(SHOP_CATALOG);
  });

  // Shop purchase endpoint - SECURE VERSION
  app.post("/api/shop/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const validationResult = shopPurchaseSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: validationResult.error.errors 
        });
      }
      
      const { itemId } = validationResult.data;

      // Validate item exists in server catalog
      const catalogItem = SHOP_CATALOG[itemId as keyof typeof SHOP_CATALOG];
      if (!catalogItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      const { title: itemTitle, tokenCost } = catalogItem;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Use transaction with concurrency protection
      const result = await db.transaction(async (tx) => {
        // Atomically deduct tokens to prevent race conditions
        const updateResult = await tx
          .update(schema.users)
          .set({
            tokens: sql`${schema.users.tokens} - ${tokenCost}`,
          })
          .where(
            and(
              eq(schema.users.id, userId),
              sql`${schema.users.tokens} >= ${tokenCost}` // Only update if sufficient tokens
            )
          )
          .returning();

        if (!updateResult[0]) {
          throw new Error("Insufficient tokens");
        }

        // Record purchase - unique constraint prevents duplicates
        try {
          await tx.insert(schema.shopPurchases).values({
            userId,
            itemId,
            itemTitle,
            tokensSpent: tokenCost,
          });
        } catch (error: any) {
          if (error.code === '23505') { // Postgres unique violation
            throw new Error("Item already purchased");
          }
          throw error;
        }

        return { tokensRemaining: updateResult[0].tokens };
      });

      res.json({ message: "Purchase successful", tokensRemaining: result.tokensRemaining });
    } catch (error: any) {
      console.error("Shop purchase error:", error);
      if (error.message.includes("Insufficient tokens")) {
        res.status(402).json({ message: error.message }); // Payment Required
      } else if (error.message.includes("already purchased")) {
        res.status(409).json({ message: error.message }); // Conflict
      } else {
        res.status(500).json({ message: "Purchase failed" });
      }
    }
  });

  // Get user purchases endpoint
  app.get("/api/shop/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const purchases = await db
        .select()
        .from(schema.shopPurchases)
        .where(eq(schema.shopPurchases.userId, userId));

      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

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
