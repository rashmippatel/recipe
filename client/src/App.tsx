import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { HelmetProvider } from "react-helmet-async";

// Pages
import Home from "@/pages/home";
import FindRecipes from "@/pages/find-recipes";
import Favorites from "@/pages/favorites";
import RecipeFormPage from "@/pages/recipe-form-page";
import RecipeDetail from "@/pages/recipe-detail";
import Privacy from "@/pages/legal/privacy";
import Terms from "@/pages/legal/terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/find" component={FindRecipes} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/favorites/new" component={RecipeFormPage} />
          <Route path="/favorites/:id/edit">
            {(params) => <RecipeFormPage recipeId={params.id as string} />}
          </Route>
          <Route path="/recipes/:id">
            {(params) => <RecipeDetail recipeId={params.id as string} />}
          </Route>
          <Route path="/legal/privacy" component={Privacy} />
          <Route path="/legal/terms" component={Terms} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <i className="fas fa-utensils text-primary"></i>
              <span className="font-semibold">Recipe Helper</span>
            </div>
            
            <nav className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/legal/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            </nav>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2023 Recipe Helper. Made with ❤️ for home cooks everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="recipe-helper-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
