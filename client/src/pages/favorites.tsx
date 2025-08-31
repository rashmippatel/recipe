import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { RecipeDetailModal } from "@/components/recipe/recipe-detail-modal";
import { DeleteConfirmModal } from "@/components/recipe/delete-confirm-modal";
import type { RecipeWithIngredients } from "@shared/schema";
import { Helmet } from "react-helmet-async";

export default function Favorites() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [mealFilter, setMealFilter] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeWithIngredients | null>(null);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: api.getFavorites,
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: api.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe deleted",
        description: "The recipe has been permanently removed.",
      });
      setRecipeToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: api.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "The recipe has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter favorites based on search criteria
  const filteredFavorites = favorites.filter((favorite) => {
    const recipe = favorite.recipe;
    const matchesSearch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ri => ri.ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipe.sourceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || 
      (typeFilter === "vegetarian" && recipe.isVeg) ||
      (typeFilter === "non-vegetarian" && !recipe.isVeg);
    
    const matchesMeal = !mealFilter || recipe.mealTypes.includes(mealFilter);
    
    return matchesSearch && matchesType && matchesMeal;
  });

  const handleViewRecipe = (recipe: RecipeWithIngredients) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const handleDeleteRecipe = (recipe: RecipeWithIngredients) => {
    setRecipeToDelete(recipe);
  };

  const confirmDeleteRecipe = () => {
    if (recipeToDelete) {
      deleteRecipeMutation.mutate(recipeToDelete.id);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return <i className="fab fa-youtube text-red-500" />;
      case "website":
        return <i className="fas fa-globe text-blue-500" />;
      case "book":
        return <i className="fas fa-book text-green-500" />;
      default:
        return <i className="fas fa-file text-gray-500" />;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Helmet>
        <title>Favorite Recipes - Recipe Helper</title>
        <meta
          name="description"
          content="Manage your collection of saved recipes. View, edit, and organize your favorite cooking recipes."
        />
      </Helmet>

      <section className="py-12" data-testid="page-favorites">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Favorite Recipes</h1>
              <p className="text-muted-foreground mt-2">Manage your collection of saved recipes</p>
            </div>
            <Button asChild data-testid="button-add-new-recipe">
              <Link href="/favorites/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Recipe
              </Link>
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes by name, ingredient, or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-favorites"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-auto" data-testid="select-type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>
            <Select value={mealFilter} onValueChange={setMealFilter}>
              <SelectTrigger className="w-full sm:w-auto" data-testid="select-meal-filter">
                <SelectValue placeholder="All Meals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Meals</SelectItem>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Evening Snack">Evening Snack</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Recipe Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              {isLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cook Time</TableHead>
                      <TableHead>Meal Types</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No favorite recipes</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || typeFilter || mealFilter 
                      ? "No recipes match your current filters." 
                      : "Start by adding some recipes to your favorites."}
                  </p>
                  <Button asChild>
                    <Link href="/favorites/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Recipe
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cook Time</TableHead>
                      <TableHead>Meal Types</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="favorites-table-body">
                    {filteredFavorites.map((favorite) => (
                      <TableRow 
                        key={favorite.id} 
                        className="hover:bg-muted/50"
                        data-testid={`row-favorite-${favorite.id}`}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium" data-testid={`text-recipe-name-${favorite.id}`}>
                              {favorite.recipe.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {favorite.recipe.instructions.length > 50 
                                ? `${favorite.recipe.instructions.substring(0, 50)}...`
                                : favorite.recipe.instructions}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={favorite.recipe.isVeg ? "secondary" : "destructive"}
                            className={favorite.recipe.isVeg 
                              ? "bg-secondary text-secondary-foreground" 
                              : "bg-destructive/20 text-destructive"}
                            data-testid={`badge-type-${favorite.id}`}
                          >
                            {favorite.recipe.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-cook-time-${favorite.id}`}>
                          {favorite.recipe.cookTimeMin} min
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {favorite.recipe.mealTypes.map((meal) => (
                              <Badge 
                                key={meal} 
                                variant="outline"
                                data-testid={`badge-meal-${meal.toLowerCase()}-${favorite.id}`}
                              >
                                {meal}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getSourceIcon(favorite.recipe.sourceType)}
                            <span className="text-sm capitalize">
                              {favorite.recipe.sourceType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(favorite.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewRecipe(favorite.recipe)}
                              data-testid={`button-view-${favorite.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                              data-testid={`button-edit-${favorite.id}`}
                            >
                              <Link href={`/favorites/${favorite.recipe.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteRecipe(favorite.recipe)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                              data-testid={`button-delete-${favorite.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          
          {/* Results count */}
          {!isLoading && filteredFavorites.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground" data-testid="text-results-summary">
                Showing {filteredFavorites.length} of {favorites.length} recipe{favorites.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </section>

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setSelectedRecipe(null);
        }}
        onDelete={(recipeId) => {
          const recipe = favorites.find(f => f.recipe.id === recipeId)?.recipe;
          if (recipe) {
            setRecipeToDelete(recipe);
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={!!recipeToDelete}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={confirmDeleteRecipe}
        recipeName={recipeToDelete?.name || ""}
      />
    </>
  );
}
