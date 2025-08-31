# Recipe Helper - Project Documentation

## Overview

Recipe Helper is a smart recipe discovery and management application built with modern web technologies. The application provides two main workflows: finding recipes based on available ingredients with intelligent matching algorithms, and managing a personal collection of favorite recipes with full CRUD operations. The system uses deterministic scoring to rank recipes based on ingredient coverage, quantity satisfaction, and cooking time preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18 with TypeScript**: Modern React with strict TypeScript configuration for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Component Architecture**: Modular design using shadcn/ui component library with Radix UI primitives
- **Styling Strategy**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes
- **Client-Side Routing**: wouter for lightweight routing without the complexity of React Router
- **State Management**: TanStack Query for server state management with built-in caching and synchronization
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing

### Backend Architecture
- **Node.js + Express**: RESTful API server with TypeScript for type safety
- **In-Memory Storage**: Custom storage implementation using Maps for development/demo purposes
- **Recipe Matching Engine**: Deterministic scoring algorithm considering ingredient coverage, quantity satisfaction, and cooking time
- **API Design**: RESTful endpoints with consistent error handling and response formats
- **Validation Layer**: Zod schemas for request/response validation and type inference

### Data Models
- **Recipe System**: Comprehensive recipe structure with ingredients, instructions, cooking time, meal types, and source information
- **Ingredient Management**: Flexible ingredient system with quantities and units (grams, milliliters, pieces)
- **Favorites System**: Personal recipe collection with notes and metadata
- **Search Filters**: Multi-dimensional filtering by ingredients, cooking time, meal type, and dietary preferences

### Recipe Scoring Algorithm
- **Coverage Score**: Percentage of required ingredients available (|R ∩ A| / |R|)
- **Quantity Satisfaction**: Weighted satisfaction based on available vs required quantities
- **Time Bonus**: Additional scoring for recipes within preferred cooking time
- **Final Score**: Composite score ensuring deterministic ranking for consistent user experience

### User Experience Design
- **Responsive Layout**: Mobile-first design with progressive enhancement
- **Accessibility**: Semantic HTML structure with proper ARIA labels and keyboard navigation
- **Theme System**: System preference detection with manual override capability
- **Search Experience**: Real-time ingredient search with autocomplete and multi-select functionality
- **Modal System**: Overlay interfaces for recipe details and form interactions

### Development Workflow
- **Type Safety**: Strict TypeScript configuration across frontend and backend
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Component Library**: shadcn/ui for consistent design system implementation
- **Path Aliases**: Clean import statements using TypeScript path mapping
- **Development Server**: Hot module replacement and error overlay for development efficiency

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Helmet Async for SEO
- **Build Tools**: Vite with TypeScript support and React plugin
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer

### UI Component Libraries
- **Radix UI**: Comprehensive primitive components for accessibility and behavior
- **shadcn/ui**: Pre-built component library built on Radix primitives
- **Lucide React**: Consistent icon library for user interface elements
- **Class Variance Authority**: Utility for component variant management

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with minimal re-renders
- **Zod**: Schema validation and TypeScript type inference

### Backend Infrastructure
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe database ORM (configured for future PostgreSQL integration)
- **@neondatabase/serverless**: Database driver for serverless PostgreSQL

### Development Tools
- **TypeScript**: Static type checking and enhanced IDE support
- **ESLint**: Code linting for consistent code quality
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique ID generation for entities

### Database Architecture (Future)
- **PostgreSQL**: Production database (Drizzle configured but currently using in-memory storage)
- **Drizzle Kit**: Database migrations and schema management
- **Connection Pooling**: Serverless-optimized database connections