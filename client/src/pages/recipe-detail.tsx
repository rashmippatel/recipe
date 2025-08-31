import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Edit, Printer, Trash2, ExternalLink, ArrowLeft, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DeleteConfirmModal } from "@/components/recipe/delete-confirm-modal";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

interface RecipeDetailProps {
  recipeId: string;
}

export default function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ["/api/recipes", recipeId],
    queryFn: () => api.getRecipe(recipeId),
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: ["/api/favorites", "check", recipeId],
    queryFn: async () => {
      const favorites = await api.getFavorites();
      return favorites.some(fav => fav.recipeId === recipeId);
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: api.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Recipe deleted",
        description: "The recipe has been permanently removed.",
      });
      navigate("/favorites");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const favorites = await api.getFavorites();
        const favorite = favorites.find(fav => fav.recipeId === recipeId);
        if (favorite) {
          await api.removeFromFavorites(favorite.id);
        }
      } else {
        await api.addToFavorites({ recipeId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Recipe has been removed from your favorites." 
          : "Recipe has been added to your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add JSON-LD structured data
  useEffect(() => {
    if (recipe) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "recipe-schema";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Recipe",
        name: recipe.name,
        author: {
          "@type": "Person",
          name: "Recipe Helper User",
        },
        datePublished: recipe.createdAt ? new Date(recipe.createdAt).toISOString().split("T")[0] : undefined,
        description: recipe.instructions.substring(0, 200) + "...",
        prepTime: `PT${Math.floor(recipe.cookTimeMin / 2)}M`,
        cookTime: `PT${recipe.cookTimeMin}M`,
        totalTime: `PT${recipe.cookTimeMin}M`,
        keywords: [
          ...(recipe.isVeg ? ["vegetarian"] : ["non-vegetarian"]),
          ...recipe.mealTypes.map(m => m.toLowerCase()),
          ...recipe.ingredients.map(i => i.ingredient.name),
        ].join(", "),
        recipeCategory: recipe.mealTypes.join(", "),
        recipeIngredient: recipe.ingredients.map(
          (ri) => `${ri.quantity}${ri.ingredient.unit || ""} ${ri.ingredient.name}`
        ),
        recipeInstructions: recipe.instructions
          .split("\n")
          .filter(Boolean)
          .map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            text: step,
          })),
        nutrition: {
          "@type": "NutritionInformation",
        },
      });
      
      document.head.appendChild(script);
      
      return () => {
        const existingScript = document.getElementById("recipe-schema");
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [recipe]);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteRecipeMutation.mutate(recipeId);
    setShowDeleteConfirm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return "fab fa-youtube text-red-500";
      case "website":
        return "fas fa-globe text-blue-500";
      case "book":
        return "fas fa-book text-green-500";
      default:
        return "fas fa-file text-gray-500";
    }
  };

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The recipe you're looking for could not be found.
            </p>
            <Button asChild>
              <Link href="/favorites">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Favorites
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-12" data-testid="page-recipe-detail-loading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!recipe) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The recipe you're looking for could not be found.
            </p>
            <Button asChild>
              <Link href="/favorites">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Favorites
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{recipe.name} - Recipe Helper</title>
        <meta
          name="description"
          content={`Recipe for ${recipe.name}. Cooking time: ${recipe.cookTimeMin} minutes. ${recipe.isVeg ? "Vegetarian" : "Non-vegetarian"} recipe.`}
        />
        <meta property="og:title" content={`${recipe.name} - Recipe Helper`} />
        <meta property="og:description" content={recipe.instructions.substring(0, 160)} />
      </Helmet>

      <section className="py-12" data-testid="page-recipe-detail">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Button variant="outline" asChild className="mb-4" data-testid="button-back">
                <Link href="/favorites">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Favorites
                </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight" data-testid={`text-recipe-title-${recipe.id}`}>
                {recipe.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm mt-2">
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
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => toggleFavoriteMutation.mutate()}
                disabled={toggleFavoriteMutation.isPending}
                data-testid="button-toggle-favorite"
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2" data-testid={`ingredients-list-${recipe.id}`}>
                    {recipe.ingredients.map((ri) => (
                      <div
                        key={ri.id}
                        className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        data-testid={`ingredient-${ri.ingredient.name}-${recipe.id}`}
                      >
                        <span className="capitalize">{ri.ingredient.name}</span>
                        <span className="text-muted-foreground">
                          {ri.quantity}{ri.ingredient.unit || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-sm space-y-3 whitespace-pre-line"
                    data-testid={`instructions-${recipe.id}`}
                  >
                    {recipe.instructions}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recipe Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <i className={`${getSourceIcon(recipe.sourceType)} mr-2`}></i>
                    <span>Source: {recipe.sourceType}</span>
                  </div>
                  {recipe.sourceUrl && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline"
                        data-testid={`link-source-${recipe.id}`}
                      >
                        View Original
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <i className="fas fa-calendar mr-2"></i>
                    <span>Added: {formatDate(recipe.createdAt)}</span>
                  </div>
                  {recipe.famous && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <i className="fas fa-star mr-2 text-yellow-500"></i>
                      <span>Famous Recipe</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    asChild
                    className="w-full"
                    data-testid={`button-edit-${recipe.id}`}
                  >
                    <Link href={`/favorites/${recipe.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Recipe
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handlePrint}
                    className="w-full"
                    data-testid={`button-print-${recipe.id}`}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Recipe
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full"
                    data-testid={`button-delete-${recipe.id}`}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Recipe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        recipeName={recipe.name}
      />
    </>
  );
}
