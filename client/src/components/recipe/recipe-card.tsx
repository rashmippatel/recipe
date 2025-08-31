import { Heart, Clock, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { RecipeSearchResult, RecipeWithIngredients } from "@shared/schema";
import { useLocation } from "wouter";

interface RecipeCardProps {
  recipe: RecipeSearchResult | RecipeWithIngredients;
  showScore?: boolean;
  onView?: () => void;
  isFavorite?: boolean;
  favoriteId?: string;
}

export function RecipeCard({ 
  recipe, 
  showScore = false, 
  onView,
  isFavorite = false,
  favoriteId
}: RecipeCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const addToFavoritesMutation = useMutation({
    mutationFn: (recipeId: string) => api.addToFavorites({ recipeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Recipe saved!",
        description: "Recipe has been added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add recipe to favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: (id: string) => api.removeFromFavorites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Recipe removed",
        description: "Recipe has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove recipe from favorites.",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    if (isFavorite && favoriteId) {
      removeFromFavoritesMutation.mutate(favoriteId);
    } else {
      addToFavoritesMutation.mutate(recipe.id);
    }
  };

  const handleViewRecipe = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/recipes/${recipe.id}`);
    }
  };

  const scoreValue = 'score' in recipe ? Math.round(recipe.score * 100) : undefined;

  return (
    <Card className="p-6" data-testid={`card-recipe-${recipe.id}`}>
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold" data-testid={`text-recipe-name-${recipe.id}`}>
                {recipe.name}
              </h3>
              {showScore && scoreValue !== undefined && (
                <Badge 
                  className="bg-primary text-primary-foreground hover:bg-primary/80"
                  data-testid={`badge-score-${recipe.id}`}
                >
                  Score: {scoreValue}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center" data-testid={`text-cook-time-${recipe.id}`}>
                <Clock className="mr-1 h-4 w-4" /> 
                {recipe.cookTimeMin} min
              </span>
              <Badge 
                variant={recipe.isVeg ? "secondary" : "destructive"}
                className={recipe.isVeg ? "bg-secondary text-secondary-foreground" : "bg-destructive/20 text-destructive"}
                data-testid={`badge-dietary-${recipe.id}`}
              >
                {recipe.isVeg ? "Vegetarian" : "Non-Vegetarian"}
              </Badge>
              {recipe.mealTypes.map((meal) => (
                <Badge 
                  key={meal} 
                  variant="outline"
                  data-testid={`badge-meal-${meal.toLowerCase()}-${recipe.id}`}
                >
                  {meal}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleViewRecipe}
                data-testid={`button-view-recipe-${recipe.id}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Recipe
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                data-testid={`button-toggle-favorite-${recipe.id}`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Save to Favorites"}
              </Button>
              {recipe.sourceUrl && (
                <Button
                  variant="outline"
                  asChild
                  data-testid={`button-external-source-${recipe.id}`}
                >
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Source
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
