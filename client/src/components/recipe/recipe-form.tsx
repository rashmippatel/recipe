import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertRecipeSchema } from "@shared/schema";
import type { RecipeWithIngredients, Ingredient } from "@shared/schema";
import { useEffect, useState } from "react";

const recipeFormSchema = insertRecipeSchema.extend({
  mealTypes: z.array(z.string()).min(1, "At least one meal type is required"),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface RecipeFormProps {
  recipe?: RecipeWithIngredients;
  onSuccess?: (recipe: RecipeWithIngredients) => void;
  onCancel?: () => void;
}

const MEAL_TYPES = [
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Evening Snack", label: "Evening Snack" },
  { value: "Dinner", label: "Dinner" },
];

const SOURCE_TYPES = [
  { value: "website", label: "Website" },
  { value: "youtube", label: "YouTube" },
  { value: "book", label: "Book" },
  { value: "other", label: "Other" },
];

const UNITS = ["g", "ml", "pcs"];

export function RecipeForm({ recipe, onSuccess, onCancel }: RecipeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ingredientRows, setIngredientRows] = useState<Array<{
    id: string;
    ingredientId: string;
    quantity: number;
  }>>([]);

  const { data: ingredients = [] } = useQuery({
    queryKey: ["/api/ingredients"],
    queryFn: api.getAllIngredients,
  });

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: recipe?.name || "",
      isVeg: recipe?.isVeg ?? true,
      cookTimeMin: recipe?.cookTimeMin || 30,
      mealTypes: recipe?.mealTypes || [],
      instructions: recipe?.instructions || "",
      sourceType: (recipe?.sourceType as "other" | "website" | "youtube" | "book") || "other",
      sourceUrl: recipe?.sourceUrl || "",
      famous: recipe?.famous || false,
      ingredients: [],
    },
  });

  // Initialize ingredient rows from existing recipe
  useEffect(() => {
    if (recipe?.ingredients) {
      setIngredientRows(
        recipe.ingredients.map((ri) => ({
          id: ri.id,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
        }))
      );
    } else {
      setIngredientRows([{ id: crypto.randomUUID(), ingredientId: "", quantity: 1 }]);
    }
  }, [recipe]);

  const createMutation = useMutation({
    mutationFn: api.createRecipe,
    onSuccess: (newRecipe) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipe created",
        description: "Your recipe has been saved successfully.",
      });
      onSuccess?.(newRecipe);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RecipeFormData) => api.updateRecipe(recipe!.id, data),
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes", recipe!.id] });
      toast({
        title: "Recipe updated",
        description: "Your recipe has been updated successfully.",
      });
      onSuccess?.(updatedRecipe);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addIngredientRow = () => {
    setIngredientRows([
      ...ingredientRows,
      { id: crypto.randomUUID(), ingredientId: "", quantity: 1 },
    ]);
  };

  const removeIngredientRow = (id: string) => {
    setIngredientRows(ingredientRows.filter((row) => row.id !== id));
  };

  const updateIngredientRow = (id: string, field: "ingredientId" | "quantity", value: string | number) => {
    setIngredientRows(
      ingredientRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const onSubmit = (data: RecipeFormData) => {
    // Filter out empty ingredient rows and prepare ingredients data
    const validIngredients = ingredientRows
      .filter((row) => row.ingredientId && row.quantity > 0)
      .map((row) => ({
        ingredientId: row.ingredientId,
        quantity: row.quantity,
      }));

    const submitData = {
      ...data,
      ingredients: validIngredients,
    };

    if (recipe) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter recipe name" 
                        {...field} 
                        data-testid="input-recipe-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cookTimeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="480"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-cook-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isVeg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Type</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-vegetarian"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-vegetarian"
                      />
                      <Label htmlFor="is-vegetarian">Vegetarian</Label>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="famous"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Famous Recipe</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-famous"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-famous"
                      />
                      <Label htmlFor="is-famous">Mark as famous recipe</Label>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="mealTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Types *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MEAL_TYPES.map((meal) => (
                      <div key={meal.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`meal-${meal.value}`}
                          checked={field.value?.includes(meal.value)}
                          onCheckedChange={(checked) => {
                            const currentMeals = field.value || [];
                            if (checked) {
                              field.onChange([...currentMeals, meal.value]);
                            } else {
                              field.onChange(currentMeals.filter(m => m !== meal.value));
                            }
                          }}
                          data-testid={`checkbox-meal-${meal.value.toLowerCase().replace(/\s+/g, "-")}`}
                        />
                        <Label htmlFor={`meal-${meal.value}`}>{meal.label}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ingredients</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addIngredientRow}
                data-testid="button-add-ingredient-row"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ingredient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="ingredients-list">
              {ingredientRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    <Label>Ingredient</Label>
                    <Select
                      value={row.ingredientId}
                      onValueChange={(value) => updateIngredientRow(row.id, "ingredientId", value)}
                    >
                      <SelectTrigger data-testid={`select-ingredient-${index}`}>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} {ingredient.unit && `(${ingredient.unit})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateIngredientRow(row.id, "quantity", parseFloat(e.target.value) || 0)
                      }
                      data-testid={`input-ingredient-quantity-${index}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Unit</Label>
                    <div className="h-10 flex items-center px-3 text-sm border border-input rounded-md bg-muted">
                      {ingredients.find(i => i.id === row.ingredientId)?.unit || "—"}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredientRow(row.id)}
                      disabled={ingredientRows.length === 1}
                      className="hover:bg-destructive hover:text-destructive-foreground"
                      data-testid={`button-remove-ingredient-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooking Instructions *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed cooking instructions..."
                      rows={8}
                      {...field}
                      data-testid="textarea-instructions"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Source Section */}
        <Card>
          <CardHeader>
            <CardTitle>Source Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-source-type">
                          <SelectValue placeholder="Select source type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOURCE_TYPES.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/recipe"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-source-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            data-testid="button-save-recipe"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : recipe ? "Update Recipe" : "Save Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
