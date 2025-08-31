import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Recipe Helper</title>
        <meta
          name="description"
          content="Terms of service for Recipe Helper. Read our terms and conditions for using the application."
        />
      </Helmet>

      <section className="py-12" data-testid="page-terms">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  By accessing and using Recipe Helper, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use License</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Permission is granted to use Recipe Helper for personal, non-commercial purposes, including:
                </p>
                <ul>
                  <li>Finding and managing recipes</li>
                  <li>Storing personal recipe collections</li>
                  <li>Using the recipe matching algorithm</li>
                </ul>
                <p>
                  This license shall automatically terminate if you violate any of these restrictions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Responsibility</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  You are responsible for:
                </p>
                <ul>
                  <li>The accuracy of recipes you add to the system</li>
                  <li>Respecting copyright when adding recipes from external sources</li>
                  <li>Not adding inappropriate or harmful content</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Recipe Helper is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul>
                  <li>The accuracy of recipe information</li>
                  <li>The safety of cooking instructions</li>
                  <li>Continuous availability of the service</li>
                  <li>Compatibility with all dietary restrictions or allergies</li>
                </ul>
                <p>
                  Always use your own judgment when following recipes and cooking instructions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limitations</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Recipe Helper shall not be liable for any damages arising from the use of this application, 
                  including but not limited to:
                </p>
                <ul>
                  <li>Loss of data</li>
                  <li>Cooking accidents or food safety issues</li>
                  <li>Dietary complications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modifications</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Recipe Helper may revise these terms of service at any time without notice. 
                  By using this application, you agree to be bound by the current version of these terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
