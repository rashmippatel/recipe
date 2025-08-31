# Recipe Helper

A smart recipe discovery and management application that helps you find recipes based on available ingredients and organize your favorite recipes.

## Features

### Workflow 1: Find Recipes
- **Ingredient-based search**: Select ingredients you have on hand with quantities
- **Smart filtering**: Filter by max cook time, meal type, dietary preferences
- **Intelligent matching**: Deterministic scoring algorithm that considers ingredient coverage, quantity satisfaction, and cooking time
- **Famous recipes toggle**: Include/exclude curated famous recipes from results
- **Top 3 results**: Always shows the best 3 matching recipes with detailed scores

### Workflow 2: Favorites Management
- **Full CRUD operations**: Create, read, update, and delete recipes
- **Comprehensive recipe details**: Ingredients with quantities, instructions, cooking time, meal types, source information
- **Search and filtering**: Find recipes by name, ingredient, source, or dietary type
- **Recipe sources**: Support for website, YouTube, book, and other sources
- **Structured data**: JSON-LD schema for SEO optimization

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling with dark mode support
- **wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **React Hook Form + Zod** for form handling and validation
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend
- **Node.js + Express** with TypeScript
- **In-memory storage** with seeded data
- **Zod validation** for API endpoints
- **RESTful API design** with proper error handling

### Quality & Testing
- **TypeScript** strict mode
- **ESLint + Prettier** for code quality
- **Accessibility** features with semantic HTML
- **SEO optimization** with meta tags and structured data

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
