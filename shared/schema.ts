import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tokens: integer("tokens").default(100).notNull(),
  totalExercises: integer("total_exercises").default(0).notNull(),
  totalProblems: integer("total_problems").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const problems = pgTable("problems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  ocrText: text("ocr_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const solutions = pgTable("solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  tokenCost: integer("token_cost").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  similarity: integer("similarity").default(100).notNull(), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  reps: integer("reps").notNull(),
  tokenReward: integer("token_reward").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-3
  estimatedTime: varchar("estimated_time").notNull(),
  instructions: text("instructions").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userExercises = pgTable("user_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  completed: boolean("completed").default(false).notNull(),
  repsCompleted: integer("reps_completed").default(0).notNull(),
  tokensEarned: integer("tokens_earned").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSolutions = pgTable("user_solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  solutionId: varchar("solution_id").notNull().references(() => solutions.id),
  problemId: varchar("problem_id").references(() => problems.id),
  tokensSpent: integer("tokens_spent").notNull(),
  accessedAt: timestamp("accessed_at").defaultNow(),
}, (table) => ({
  userSolutionUnique: unique("user_solutions_user_solution_unique").on(table.userId, table.solutionId),
}));

export const shopPurchases = pgTable("shop_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull(),
  itemTitle: text("item_title").notNull(),
  tokensSpent: integer("tokens_spent").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
}, (table) => ({
  userItemUnique: unique("shop_purchases_user_item_unique").on(table.userId, table.itemId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProblemSchema = createInsertSchema(problems).omit({
  id: true,
  createdAt: true,
});

export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertUserExerciseSchema = createInsertSchema(userExercises).omit({
  id: true,
  createdAt: true,
});

export const insertUserSolutionSchema = createInsertSchema(userSolutions).omit({
  id: true,
});

export const insertShopPurchaseSchema = createInsertSchema(shopPurchases).omit({
  id: true,
  purchasedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problems.$inferSelect;
export type InsertSolution = z.infer<typeof insertSolutionSchema>;
export type Solution = typeof solutions.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertUserExercise = z.infer<typeof insertUserExerciseSchema>;
export type UserExercise = typeof userExercises.$inferSelect;
export type InsertUserSolution = z.infer<typeof insertUserSolutionSchema>;
export type UserSolution = typeof userSolutions.$inferSelect;
