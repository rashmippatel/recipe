import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { SearchableMultiSelect } from "@/components/recipe/searchable-multi-select";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { RecipeDetailModal } from "@/components/recipe/recipe-detail-modal";
import { api } from "@/lib/api";
import type { RecipeFilters, SelectedIngredient } from "@/types/recipe";
import type { RecipeSearchResult, RecipeWithIngredients } from "@shared/schema";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";

const MEAL_OPTIONS = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Evening Snack", label: "Evening Snack" },
  { value: "Dinner", label: "Dinner" },
];

export default function FindRecipes() {
  const [location, navigate] = useLocation();
  const [filters, setFilters] = useState<RecipeFilters>({
    ingredients: [],
    maxTime: undefined,
    meal: "",
    vegOnly: false,
    includeFamous: true,
  });
  
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ingredientNames = urlParams.get("ingredients")?.split(",") || [];
    const quantities = urlParams.get("quantities")?.split(",").map(q => parseFloat(q)) || [];
    const maxTime = urlParams.get("maxTime") ? parseInt(urlParams.get("maxTime")!) : undefined;
    const meal = urlParams.get("meal") || "";
    const vegOnly = urlParams.get("vegOnly") === "true";
    const includeFamous = urlParams.get("includeFamous") !== "false";

    if (ingredientNames.length > 0) {
      // We'll need to fetch ingredients to get full data, for now just save what we have
      setFilters(prev => ({
        ...prev,
        maxTime,
        meal,
        vegOnly,
        includeFamous,
      }));
      setHasSearched(true);
    }
  }, []);

  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ["/api/recipes/search", filters],
    queryFn: () => api.searchRecipes(filters),
    enabled: hasSearched && filters.ingredients.length > 0,
  });

  const { data: recipeDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["/api/recipes", selectedRecipe?.id],
    queryFn: () => selectedRecipe ? api.getRecipe(selectedRecipe.id) : null,
    enabled: !!selectedRecipe,
  });

  const updateFilters = (updates: Partial<RecipeFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const updateURLParams = (currentFilters: RecipeFilters) => {
    const params = new URLSearchParams();
    
    if (currentFilters.ingredients.length > 0) {
      params.set("ingredients", currentFilters.ingredients.map(i => i.name).join(","));
      params.set("quantities", currentFilters.ingredients.map(i => i.quantity.toString()).join(","));
    }
    
    if (currentFilters.maxTime) {
      params.set("maxTime", currentFilters.maxTime.toString());
    }
    
    if (currentFilters.meal) {
      params.set("meal", currentFilters.meal);
    }
    
    params.set("vegOnly", currentFilters.vegOnly.toString());
    params.set("includeFamous", currentFilters.includeFamous.toString());

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newURL);
  };

  const handleSearch = () => {
    if (filters.ingredients.length === 0) {
      return;
    }
    
    setHasSearched(true);
    updateURLParams(filters);
  };

  const handleViewRecipe = (recipe: RecipeSearchResult) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  return (
    <>
      <Helmet>
        <title>Find Recipes - Recipe Helper</title>
        <meta
          name="description"
          content="Discover recipes based on ingredients you have available. Use our intelligent matching system to find the perfect meal."
        />
      </Helmet>

      <section className="py-12 bg-muted/30" data-testid="page-find-recipes">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Find Recipes</h1>
            <p className="text-muted-foreground mt-2">Discover recipes based on what you have available</p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Filter Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Recipe Filters</h2>
                
                <div className="space-y-4">
                  {/* Ingredients Section */}
                  <SearchableMultiSelect
                    selectedIngredients={filters.ingredients}
                    onIngredientsChange={(ingredients) => updateFilters({ ingredients })}
                  />
                  
                  {/* Max Cook Time */}
                  <div className="space-y-2">
                    <Label htmlFor="max-time">Max Cook Time (minutes)</Label>
                    <Input
                      id="max-time"
                      type="number"
                      min="1"
                      max="480"
                      placeholder="60"
                      value={filters.maxTime || ""}
                      onChange={(e) => 
                        updateFilters({ 
                          maxTime: e.target.value ? parseInt(e.target.value) : undefined 
                        })
                      }
                      data-testid="input-max-cook-time"
                    />
                  </div>
                  
                  {/* Meal Type */}
                  <div className="space-y-3">
                    <Label>Meal of the Day</Label>
                    <RadioGroup 
                      value={filters.meal} 
                      onValueChange={(value) => updateFilters({ meal: value })}
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={option.value} 
                            id={option.value.toLowerCase()}
                            data-testid={`radio-meal-${option.value.toLowerCase().replace(/\s+/g, "-")}`}
                          />
                          <Label htmlFor={option.value.toLowerCase()}>{option.label}</Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="" id="meal-any" />
                        <Label htmlFor="meal-any">Any Meal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Additional Filters */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="veg-only"
                        checked={filters.vegOnly}
                        onCheckedChange={(checked) => updateFilters({ vegOnly: !!checked })}
                        data-testid="checkbox-veg-only"
                      />
                      <Label htmlFor="veg-only">Vegetarian only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="famous-recipes"
                        checked={filters.includeFamous}
                        onCheckedChange={(checked) => updateFilters({ includeFamous: !!checked })}
                        data-testid="checkbox-include-famous"
                      />
                      <Label htmlFor="famous-recipes">Include famous recipes</Label>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSearch}
                    disabled={filters.ingredients.length === 0 || isSearching}
                    className="w-full"
                    data-testid="button-search-recipes"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isSearching ? "Searching..." : "Find Recipes"}
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* Right Results Panel */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Top Recipe Matches</h2>
                  {hasSearched && (
                    <span className="text-sm text-muted-foreground" data-testid="text-results-count">
                      {isSearching ? "Searching..." : `${searchResults.length} results found`}
                    </span>
                  )}
                </div>
                
                {/* Recipe Results */}
                <div className="space-y-4" data-testid="results-container">
                  {!hasSearched ? (
                    <div className="text-center py-12">
                      <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Ready to Find Recipes?</h3>
                      <p className="text-muted-foreground">
                        Select some ingredients from the filters panel to get started.
                      </p>
                    </div>
                  ) : isSearching ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-6">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <div className="flex space-x-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <div className="flex space-x-2">
                              <Skeleton className="h-9 w-24" />
                              <Skeleton className="h-9 w-32" />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : searchError ? (
                    <div className="text-center py-12">
                      <div className="text-destructive mb-2">Error loading recipes</div>
                      <p className="text-sm text-muted-foreground">
                        Please try again or adjust your search criteria.
                      </p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-muted-foreground mb-2">No recipes found</div>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your ingredient selection or filters.
                      </p>
                    </div>
                  ) : (
                    searchResults.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        showScore={true}
                        onView={() => handleViewRecipe(recipe)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RecipeDetailModal
        recipe={recipeDetail || selectedRecipe}
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setSelectedRecipe(null);
        }}
      />
    </>
  );
}
