import { useState, useRef, useEffect } from "react";
import { Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Ingredient } from "@shared/schema";
import type { SelectedIngredient } from "@/types/recipe";
import { useToast } from "@/hooks/use-toast";

interface SearchableMultiSelectProps {
  selectedIngredients: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  className?: string;
}

export function SearchableMultiSelect({
  selectedIngredients,
  onIngredientsChange,
  className = "",
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("g");
  const [showAddForm, setShowAddForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ["/api/ingredients", searchQuery],
    queryFn: () => searchQuery ? api.searchIngredients(searchQuery) : api.getAllIngredients(),
  });

  const createIngredientMutation = useMutation({
    mutationFn: api.createIngredient,
    onSuccess: (newIngredient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      // Auto-select the newly created ingredient
      onIngredientsChange([
        ...selectedIngredients,
        {
          id: newIngredient.id,
          name: newIngredient.name,
          unit: newIngredient.unit,
          quantity: 1,
        },
      ]);
      setNewIngredientName("");
      setShowAddForm(false);
      setOpen(false);
      toast({
        title: "Ingredient added",
        description: `${newIngredient.name} has been created and selected.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create ingredient. Please try again.",
        variant: "destructive",
      });
    },
  });

  const availableIngredients = ingredients.filter(
    (ingredient) =>
      !selectedIngredients.some((selected) => selected.id === ingredient.id)
  );

  const filteredIngredients = availableIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectIngredient = (ingredient: Ingredient) => {
    const newSelected: SelectedIngredient = {
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      quantity: 1,
    };

    onIngredientsChange([...selectedIngredients, newSelected]);
    setOpen(false);
    setSearchQuery("");
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    onIngredientsChange(
      selectedIngredients.filter((ingredient) => ingredient.id !== ingredientId)
    );
  };

  const handleQuantityChange = (ingredientId: string, quantity: number) => {
    onIngredientsChange(
      selectedIngredients.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: Math.max(0, quantity) }
          : ingredient
      )
    );
  };

  const handleCreateIngredient = () => {
    if (!newIngredientName.trim()) return;
    
    createIngredientMutation.mutate({
      name: newIngredientName.trim(),
      unit: newIngredientUnit,
    });
  };

  useEffect(() => {
    if (searchQuery && filteredIngredients.length === 0 && !isLoading) {
      setShowAddForm(true);
      setNewIngredientName(searchQuery);
    } else {
      setShowAddForm(false);
    }
  }, [searchQuery, filteredIngredients.length, isLoading]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <Label htmlFor="ingredient-search">Ingredients on Hand</Label>
        <div className="mt-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start text-left font-normal"
                data-testid="button-ingredient-search"
              >
                Search and select ingredients...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  ref={inputRef}
                  placeholder="Search ingredients..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  data-testid="input-ingredient-search"
                />
                <CommandList>
                  {isLoading ? (
                    <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                  ) : (
                    <>
                      {filteredIngredients.length > 0 && (
                        <CommandGroup heading="Available Ingredients">
                          {filteredIngredients.map((ingredient) => (
                            <CommandItem
                              key={ingredient.id}
                              onSelect={() => handleSelectIngredient(ingredient)}
                              data-testid={`item-ingredient-${ingredient.name}`}
                            >
                              <Check className="mr-2 h-4 w-4 opacity-0" />
                              <span className="flex-1">{ingredient.name}</span>
                              {ingredient.unit && (
                                <span className="text-xs text-muted-foreground">
                                  ({ingredient.unit})
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                      
                      {showAddForm && (
                        <CommandGroup heading="Add New Ingredient">
                          <div className="p-2 space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Ingredient name"
                                value={newIngredientName}
                                onChange={(e) => setNewIngredientName(e.target.value)}
                                className="flex-1"
                                data-testid="input-new-ingredient-name"
                              />
                              <select
                                value={newIngredientUnit}
                                onChange={(e) => setNewIngredientUnit(e.target.value)}
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                data-testid="select-new-ingredient-unit"
                              >
                                <option value="g">g</option>
                                <option value="ml">ml</option>
                                <option value="pcs">pcs</option>
                              </select>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCreateIngredient}
                              disabled={createIngredientMutation.isPending || !newIngredientName.trim()}
                              className="w-full"
                              data-testid="button-create-ingredient"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Ingredient
                            </Button>
                          </div>
                        </CommandGroup>
                      )}
                      
                      {!isLoading && filteredIngredients.length === 0 && !showAddForm && (
                        <CommandEmpty>No ingredients found.</CommandEmpty>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Ingredients with Quantities */}
        {selectedIngredients.length > 0 && (
          <div className="mt-3 space-y-2" data-testid="selected-ingredients-list">
            {selectedIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between bg-muted rounded-md p-2"
                data-testid={`selected-ingredient-${ingredient.name}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm capitalize">{ingredient.name}</span>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Qty"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleQuantityChange(ingredient.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 h-7 text-xs"
                    data-testid={`input-quantity-${ingredient.name}`}
                  />
                  {ingredient.unit && (
                    <span className="text-xs text-muted-foreground">
                      {ingredient.unit}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  className="text-muted-foreground hover:text-destructive h-auto p-1"
                  data-testid={`button-remove-${ingredient.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
