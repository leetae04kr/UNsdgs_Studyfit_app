import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { exercises } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log(`[SERVER] Starting server in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Add API route protection middleware before registering routes
  app.use('/api/*', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.originalUrl} - API route matched`);
    next();
  });
  
  const server = await registerRoutes(app);
  console.log('[SERVER] API routes registered');

  // Auto-seed database on startup if empty
  try {
    const existingExercises = await db.select().from(exercises).limit(1);
    if (existingExercises.length === 0) {
      console.log('[AUTO-SEED] No exercises found, triggering auto-seed...');
      
      // Call the seed endpoint internally via HTTP request
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/seed', { method: 'POST' });
          if (response.ok) {
            console.log('[AUTO-SEED] Database seeded successfully');
          } else {
            console.error('[AUTO-SEED] Failed to seed database:', await response.text());
          }
        } catch (error) {
          console.error('[AUTO-SEED] Error during auto-seed:', error);
        }
      }, 1000); // Wait 1 second for server to be fully ready
    } else {
      console.log(`[AUTO-SEED] Found ${existingExercises.length} exercise(s), skipping auto-seed`);
    }
  } catch (error) {
    console.error('[AUTO-SEED] Error checking database:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    console.log('[SERVER] Setting up Vite for development');
    await setupVite(app, server);
  } else {
    console.log('[SERVER] Setting up static file serving for production');
    serveStatic(app);
  }
  console.log('[SERVER] Frontend setup complete');

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
