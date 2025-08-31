import { useQuery } from "@tanstack/react-query";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";

interface RecipeFormPageProps {
  recipeId?: string;
}

export default function RecipeFormPage({ recipeId }: RecipeFormPageProps) {
  const [, navigate] = useLocation();
  const isEditing = !!recipeId;

  const { data: recipe, isLoading } = useQuery({
    queryKey: ["/api/recipes", recipeId],
    queryFn: () => recipeId ? api.getRecipe(recipeId) : null,
    enabled: !!recipeId,
  });

  const handleSuccess = () => {
    navigate("/favorites");
  };

  const handleCancel = () => {
    navigate("/favorites");
  };

  if (isEditing && isLoading) {
    return (
      <section className="py-12" data-testid="page-recipe-form-loading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isEditing && !recipe) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
            <p className="text-muted-foreground">
              The recipe you're trying to edit could not be found.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? `Edit ${recipe?.name} - Recipe Helper` : "Add New Recipe - Recipe Helper"}</title>
        <meta
          name="description"
          content={isEditing 
            ? `Edit the recipe for ${recipe?.name}. Update ingredients, instructions, and cooking details.`
            : "Add a new recipe to your collection. Include ingredients, instructions, and cooking details."
          }
        />
      </Helmet>

      <section className="py-12" data-testid="page-recipe-form">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Edit Recipe" : "Add New Recipe"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isEditing 
                ? "Update your recipe details and ingredients"
                : "Create a detailed recipe with ingredients and instructions"
              }
            </p>
          </div>
          
          <RecipeForm
            recipe={recipe || undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </section>
    </>
  );
}
