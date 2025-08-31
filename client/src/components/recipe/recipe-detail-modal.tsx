import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Printer, Trash2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import type { RecipeWithIngredients } from "@shared/schema";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { useState, useEffect } from "react";

interface RecipeDetailModalProps {
  recipe: RecipeWithIngredients | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (recipeId: string) => void;
}

export function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
  onDelete,
}: RecipeDetailModalProps) {
  const [, navigate] = useLocation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add JSON-LD structured data when modal opens
  useEffect(() => {
    if (isOpen && recipe) {
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
  }, [isOpen, recipe]);

  if (!recipe) return null;

  const handleEdit = () => {
    onClose();
    navigate(`/favorites/${recipe.id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete?.(recipe.id);
    setShowDeleteConfirm(false);
    onClose();
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-recipe-detail">
          <DialogHeader>
            <DialogTitle className="text-2xl" data-testid={`text-recipe-title-${recipe.id}`}>
              {recipe.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center" data-testid={`text-cook-time-detail-${recipe.id}`}>
                  <Clock className="mr-1 h-4 w-4" /> 
                  {recipe.cookTimeMin} min
                </span>
                <Badge 
                  variant={recipe.isVeg ? "secondary" : "destructive"}
                  className={recipe.isVeg ? "bg-secondary text-secondary-foreground" : "bg-destructive/20 text-destructive"}
                  data-testid={`badge-dietary-detail-${recipe.id}`}
                >
                  {recipe.isVeg ? "Vegetarian" : "Non-Vegetarian"}
                </Badge>
                {recipe.mealTypes.map((meal) => (
                  <Badge 
                    key={meal} 
                    variant="outline"
                    data-testid={`badge-meal-detail-${meal.toLowerCase()}-${recipe.id}`}
                  >
                    {meal}
                  </Badge>
                ))}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Ingredients</h3>
                <div className="space-y-2" data-testid={`ingredients-detail-${recipe.id}`}>
                  {recipe.ingredients.map((ri) => (
                    <div
                      key={ri.id}
                      className="flex justify-between items-center py-2 border-b border-border"
                      data-testid={`ingredient-item-${ri.ingredient.name}-${recipe.id}`}
                    >
                      <span className="capitalize">{ri.ingredient.name}</span>
                      <span className="text-muted-foreground">
                        {ri.quantity}{ri.ingredient.unit || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Instructions</h3>
              <div 
                className="text-sm text-muted-foreground space-y-3 whitespace-pre-line"
                data-testid={`instructions-detail-${recipe.id}`}
              >
                {recipe.instructions}
              </div>
              
              <div className="mt-6 space-y-2">
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
                      data-testid={`link-source-url-${recipe.id}`}
                    >
                      View Original
                    </a>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <i className="fas fa-calendar mr-2"></i>
                  <span>Added: {formatDate(recipe.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleEdit}
                  className="w-full"
                  data-testid={`button-edit-recipe-${recipe.id}`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Recipe
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePrint}
                  className="w-full"
                  data-testid={`button-print-recipe-${recipe.id}`}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print Recipe
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                  data-testid={`button-delete-recipe-${recipe.id}`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Recipe
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        recipeName={recipe.name}
      />
    </>
  );
}
