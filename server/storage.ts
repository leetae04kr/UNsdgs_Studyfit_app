import {
  users,
  problems,
  solutions,
  exercises,
  userExercises,
  userSolutions,
  type User,
  type UpsertUser,
  type Problem,
  type InsertProblem,
  type Solution,
  type Exercise,
  type UserExercise,
  type InsertUserExercise,
  type InsertUserSolution,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserTokens(userId: string, tokenChange: number): Promise<User>;
  
  // Problem operations
  createProblem(problem: InsertProblem): Promise<Problem>;
  getUserProblems(userId: string): Promise<Problem[]>;
  
  // Solution operations
  getAllSolutions(): Promise<Solution[]>;
  getSolution(id: string): Promise<Solution | undefined>;
  
  // Exercise operations
  getAllExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createUserExercise(userExercise: InsertUserExercise): Promise<UserExercise>;
  completeUserExercise(id: string, repsCompleted: number, tokensEarned: number): Promise<UserExercise>;
  getUserExercises(userId: string): Promise<UserExercise[]>;
  
  // Purchase operations
  purchaseSolution(userId: string, solutionId: string, problemId?: string): Promise<boolean>;
  getUserSolutions(userId: string): Promise<Solution[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserTokens(userId: string, tokenChange: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        tokens: tokenChange > 0 
          ? sql`${users.tokens} + ${tokenChange}`
          : sql`GREATEST(0, ${users.tokens} + ${tokenChange})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Problem operations
  async createProblem(problem: InsertProblem): Promise<Problem> {
    const [newProblem] = await db
      .insert(problems)
      .values(problem)
      .returning();
    return newProblem;
  }

  async getUserProblems(userId: string): Promise<Problem[]> {
    return await db
      .select()
      .from(problems)
      .where(eq(problems.userId, userId))
      .orderBy(desc(problems.createdAt));
  }

  // Solution operations
  async getAllSolutions(): Promise<Solution[]> {
    return await db.select().from(solutions);
  }

  async getSolution(id: string): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.id, id));
    return solution;
  }

  // Exercise operations
  async getAllExercises(): Promise<Exercise[]> {
    return await db.select().from(exercises);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
    return exercise;
  }

  async createUserExercise(userExercise: InsertUserExercise): Promise<UserExercise> {
    const [newUserExercise] = await db
      .insert(userExercises)
      .values(userExercise)
      .returning();
    return newUserExercise;
  }

  async completeUserExercise(id: string, repsCompleted: number, tokensEarned: number): Promise<UserExercise> {
    const [completed] = await db
      .update(userExercises)
      .set({
        completed: true,
        repsCompleted,
        tokensEarned,
        completedAt: new Date(),
      })
      .where(eq(userExercises.id, id))
      .returning();
    return completed;
  }

  async getUserExercises(userId: string): Promise<UserExercise[]> {
    return await db
      .select()
      .from(userExercises)
      .where(eq(userExercises.userId, userId))
      .orderBy(desc(userExercises.createdAt));
  }

  // Purchase operations
  async purchaseSolution(userId: string, solutionId: string, problemId?: string): Promise<boolean> {
    const solution = await this.getSolution(solutionId);
    
    if (!solution) {
      return false;
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Atomically deduct tokens to prevent race conditions
        const updateResult = await tx
          .update(users)
          .set({
            tokens: sql`${users.tokens} - ${solution.tokenCost}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(users.id, userId),
              sql`${users.tokens} >= ${solution.tokenCost}` // Only update if sufficient tokens
            )
          )
          .returning();

        if (!updateResult[0]) {
          throw new Error("Insufficient tokens or user not found");
        }

        // Record purchase - unique constraint prevents duplicates
        try {
          await tx.insert(userSolutions).values({
            userId,
            solutionId,
            problemId,
            tokensSpent: solution.tokenCost,
          });
        } catch (error: any) {
          if (error.code === '23505') { // Postgres unique violation
            throw new Error("Solution already purchased");
          }
          throw error;
        }

        return true;
      });

      return result;
    } catch (error) {
      console.error("Failed to purchase solution:", error);
      return false;
    }
  }

  async getUserSolutions(userId: string): Promise<Solution[]> {
    const userSolutionsList = await db
      .select({
        solution: solutions,
      })
      .from(userSolutions)
      .innerJoin(solutions, eq(userSolutions.solutionId, solutions.id))
      .where(eq(userSolutions.userId, userId));

    return userSolutionsList.map(row => row.solution);
  }
}

export const storage = new DatabaseStorage();
