import { Button } from "@/components/ui/button";
import { Search, Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Recipe Helper - Smart Recipe Discovery & Management</title>
        <meta
          name="description"
          content="Find recipes based on available ingredients and manage your cooking favorites with our intelligent recipe helper."
        />
        <meta property="og:title" content="Recipe Helper - Smart Recipe Discovery & Management" />
        <meta property="og:description" content="Find recipes based on available ingredients and manage your cooking favorites with our intelligent recipe helper." />
      </Helmet>

      <section className="py-12 md:py-24 lg:py-32" data-testid="section-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your Smart Cooking Companion
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover delicious recipes based on ingredients you already have, and organize your favorite recipes in one convenient place.
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:gap-12 max-w-4xl mt-12">
              <div className="flex flex-col items-center space-y-4 text-center" data-testid="workflow-find-recipes">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Find Recipes</h3>
                  <p className="text-muted-foreground">
                    Select ingredients you have on hand, set your preferences, and discover the perfect recipes with intelligent matching.
                  </p>
                </div>
                <Button asChild data-testid="button-start-cooking">
                  <Link href="/find">
                    Start Cooking
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="flex flex-col items-center space-y-4 text-center" data-testid="workflow-manage-favorites">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Manage Favorites</h3>
                  <p className="text-muted-foreground">
                    Save, organize, and manage your favorite recipes with detailed ingredients, instructions, and cooking notes.
                  </p>
                </div>
                <Button variant="outline" asChild data-testid="button-manage-collection">
                  <Link href="/favorites">
                    Manage Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
