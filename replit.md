# Overview

StudyFit is a React-TypeScript web application that combines education and fitness. Users can capture photos of math or study problems to access solutions, while earning tokens by completing exercise missions. The app features OCR text recognition for problem capture, a token economy system, and fitness tracking capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a mobile-first design approach
- **UI Components**: Radix UI primitives with shadcn/ui design system and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mobile-Optimized**: Designed as a mobile-first PWA with responsive components

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Database ORM**: Drizzle ORM with PostgreSQL database schema
- **Authentication**: Replit OAuth integration with session-based authentication using express-session
- **File Processing**: Tesseract.js for OCR (Optical Character Recognition) on client-side
- **Session Storage**: PostgreSQL-backed session store with connect-pg-simple

## Database Design
- **Users Table**: Stores user profiles with token balance, exercise/problem counters, and streak tracking
- **Problems Table**: Stores captured problem images and OCR text linked to users
- **Solutions Table**: Contains problem solutions with difficulty levels and token costs
- **Exercises Table**: Defines available fitness exercises with token rewards
- **User Exercises/Solutions**: Junction tables tracking user progress and purchases

## Key Features
- **Problem Capture**: Camera integration with OCR processing for math problem recognition
- **Token Economy**: Users earn tokens through exercise completion and spend them on solutions
- **Exercise Tracking**: Fitness mission system with real-time rep counting and progress tracking
- **Solution Marketplace**: Token-gated access to problem solutions with difficulty-based pricing

## API Structure
- RESTful endpoints for user management, problem creation, solution access, and exercise tracking
- Session-based authentication middleware protecting all user-specific routes
- File upload handling for problem images with OCR text extraction

# External Dependencies

## Database Services
- **Neon Database**: PostgreSQL hosting service with serverless connection pooling
- **Database URL**: Environment variable required for database connectivity

## Authentication Services
- **Replit Auth**: OAuth provider integration for user authentication
- **Required Environment Variables**: REPLIT_DOMAINS, ISSUER_URL, SESSION_SECRET

## OCR Processing
- **Tesseract.js**: Client-side optical character recognition library
- **Browser Camera API**: Native camera access for problem capture

## UI and Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Shadcn/ui**: Pre-built component library built on Radix UI

## Development Tools
- **Replit-specific**: Development plugins for error overlay, cartographer, and dev banner
- **Vite Plugins**: React plugin and runtime error modal for development experience