# Portugal Golf Trip 2025 - Golf Management System

## Overview

This is a comprehensive golf trip management application built for the Portugal Golf Trip 2025. The system provides real-time scoring, fines tracking, activity voting, and course information management. Built as a full-stack web application with React frontend and Express backend, using PostgreSQL for data persistence and local storage for offline functionality.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom golf-themed color variables
- **State Management**: TanStack React Query for server state, local state with React hooks
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Primary Database**: PostgreSQL (configurable via DATABASE_URL)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Backup Storage**: Local storage for offline functionality

## Key Components

### Core Entities
1. **Players** - Golf trip participants management
2. **Rounds** - Golf rounds with course and date information
3. **Scores** - Individual hole scores for each player
4. **Fines** - Penalty tracking system with types and amounts
5. **Votes** - Activity voting system for group decisions

### Frontend Pages
- **Home** - Trip overview and quick navigation
- **Schedule** - Daily itinerary and course schedule
- **Courses** - Detailed course information with hole layouts
- **Scoring** - Live scorecard and leaderboard
- **Fines** - Penalty tracking and statistics
- **Activities** - Voting system for Friday activities

### Backend Services
- **Storage Layer** - Abstracted storage interface with memory and database implementations
- **API Routes** - RESTful endpoints for all entities
- **Validation** - Zod schema validation for all inputs

## Data Flow

### Client-Server Communication
1. Frontend makes HTTP requests to `/api/*` endpoints
2. Express server validates requests using Zod schemas
3. Storage layer abstracts database operations
4. Responses return JSON data with proper error handling

### Offline Functionality
- Local storage maintains data when offline
- Seamless sync when connection restored
- Critical data cached for uninterrupted gameplay

### Real-time Features
- Live scoring updates across devices
- Instant leaderboard calculations
- Real-time fine tracking and statistics

## External Dependencies

### Frontend Dependencies
- **UI Components**: @radix-ui/* components for accessible UI primitives
- **Routing**: wouter for lightweight routing
- **HTTP Client**: TanStack React Query with built-in fetch
- **Form Handling**: react-hook-form with @hookform/resolvers
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Icons**: Lucide React icons
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for validation
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build**: Vite with React plugin
- **Type Checking**: TypeScript with strict configuration
- **Database**: Drizzle Kit for migrations and schema management
- **Deployment**: Configured for Replit with autoscale deployment

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Process Management**: npm scripts for development workflow

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Database**: Migrations applied via `npm run db:push`

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Development**: NODE_ENV=development for dev features
- **Production**: NODE_ENV=production for optimized builds

### Scaling Considerations
- **Autoscale Deployment**: Configured for Replit's autoscale infrastructure
- **Session Persistence**: PostgreSQL-backed sessions for multi-instance support
- **Asset Optimization**: Vite builds optimized bundles with code splitting

## Changelog

- June 14, 2025: Initial setup with basic golf management features
- June 14, 2025: Enhanced scoring system with player profiles, teams, and advanced tracking
  - Added player management with first/last name and handicaps
  - Implemented team system with captains and 4-player limit
  - Enhanced scoring with 3-putt, picked up, water, and bunker tracking
  - Added team-based leaderboards alongside individual scoring
  - Created Players page for profile and team management
- June 14, 2025: Integrated PostgreSQL database for persistent data storage
  - Replaced in-memory storage with DatabaseStorage class
  - Applied Drizzle schema migrations to PostgreSQL
  - All data now persists across application restarts
  - Maintained existing IStorage interface for seamless transition
- June 14, 2025: Enhanced home page layout and fines system improvements
  - Repositioned navigation cards below daily schedule section
  - Removed "5 Days" overview card as requested
  - Updated fines system with golf day tracking (July 2, 3, 5)
  - Implemented per-player per-day fines functionality with database integration
  - Fixed JSX syntax errors and improved component structure
- June 14, 2025: Fixed UI formatting and accessibility issues
  - Resolved first place leaderboard visibility with yellow background instead of dark green
  - Repositioned scorecard Gross/Net toggle below Score/Stats section as requested
  - Added accessibility DialogDescription components to fix console warnings
  - Improved scorecard layout with clearer scoring mode indicators
  - Enhanced visual hierarchy for better user experience
- June 14, 2025: Enhanced scorecard and leaderboard functionality
  - Added hole numbers (1-18) in header row above par values for better navigation
  - Implemented matching Score/Stats and Gross/Net filters on home page leaderboards
  - Added net scoring calculations with handicap adjustments for both individual and team standings
  - Unified interface design across scoring page and home page leaderboards
  - Improved scorecard table structure with clearer column headers
- June 14, 2025: Fixed leaderboard data consistency and added round management
  - Resolved data inconsistency between scorecard and home page leaderboard calculations
  - Cleaned up duplicate rounds in database that were causing calculation errors
  - Switched from memory storage to database storage for proper data persistence
  - Added round management functionality with ability to select and delete scorecards
  - Implemented proper hole-by-hole handicap calculations using actual course data
  - Added DELETE /api/rounds/:id endpoint and RoundSelector component for scorecard management
  - Added "Clear Scorecard" functionality with POST /api/rounds/:id/clear endpoint to remove all scores while keeping round structure
- June 14, 2025: Added team management capabilities
  - Implemented team editing functionality with dialog form pre-population
  - Added team deletion with proper player reassignment handling
  - Enhanced Players page with edit/delete buttons for each team card
  - Updated team dialog to handle both create and edit operations with dynamic titles
- June 15, 2025: Implemented comprehensive matchplay system for Portugal 2025 format
  - Added database schema for matches, individual matches, Stableford scores, and hole results
  - Created API endpoints for all matchplay functionality with proper validation
  - Built MatchplaySetup component for team pairing and round creation
  - Developed MatchplayScorecard component with Stableford scoring calculations
  - Added Matchplay page with Day 1-3 tabs and format-specific features
  - Integrated betterball Stableford format (Days 1-2) and individual matchplay (Day 3)
  - Implemented match status tracking (1UP, 2&1, AS) and live hole-by-hole scoring
  - Added navigation link and complete workflow for tournament-style play
- June 16, 2025: Enhanced matchplay system with proper data structure and fourball management
  - Populated system with 8 players organized into 2 teams of 4 players each
  - Fixed duplicate course selection issue to ensure one course per day with multiple fourballs
  - Implemented proper fourball editing functionality with match deletion and recreation
  - Fixed empty leaderboard by correcting API routes and data aggregation logic
  - Ensured maximum of 2 fourballs (matches) for 8 players following standard golf format
  - Team A: John Doe, Jane Smith, Chris Slack, Mike Johnson
  - Team B: Sarah Wilson, David Brown, Emma Davis, Tom Miller
- June 18, 2025: Major system simplification and score entry fixes
  - Eliminated complex round ID selection - system now has exactly 3 rounds (one per course per day)
  - Fixed score entry functionality with proper dialog and API integration
  - Added Stableford scoring mode to leaderboards with handicap-adjusted calculations
  - Implemented delete round functionality for UX management
  - Simplified data structure to eliminate user confusion around round selection
- June 18, 2025: Fixed scorecard/leaderboard data consistency and matchplay validation
  - Resolved data mismatch between scorecard stroke play scores and matchplay leaderboard
  - Added backend validation to enforce maximum 2 fourballs per day (8 players total)
  - Implemented duplicate player assignment prevention across fourballs
  - Cleaned up database inconsistencies (removed orphaned scores and duplicate rounds)
  - Ensured one score per player per hole per course per day constraint is enforced
  - System now has clean data structure: 1 round (NAU Day 1), 8 players, 9 scores total
- June 19, 2025: Redesigned score entry dialog with mobile-first interface
  - Replaced text input with mobile-style score button grid (1-10) for easier selection
  - Enhanced hole information display with par, handicap, and course details
  - Added Portugal Golf 2025 header and golf green theme throughout interface
  - Fixed button visibility issues with inline styling for reliable text contrast
  - Implemented flexible dialog layout ensuring Save button always visible
  - Enhanced checkbox interaction with clickable areas and hover effects
  - Successfully integrated with existing API for score saving functionality

## User Preferences

Preferred communication style: Simple, everyday language.