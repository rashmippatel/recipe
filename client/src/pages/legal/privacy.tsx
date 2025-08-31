import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Recipe Helper</title>
        <meta
          name="description"
          content="Privacy policy for Recipe Helper. Learn how we handle your data and protect your privacy."
        />
      </Helmet>

      <section className="py-12" data-testid="page-privacy">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
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
                <CardTitle>Data Collection</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Recipe Helper is designed with privacy in mind. Currently, the application:
                </p>
                <ul>
                  <li>Stores all recipe and favorite data locally in your browser</li>
                  <li>Does not collect personal information</li>
                  <li>Does not use cookies for tracking</li>
                  <li>Does not share data with third parties</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Storage</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Your recipes and preferences are stored locally in your browser using:
                </p>
                <ul>
                  <li>LocalStorage for theme preferences</li>
                  <li>In-memory storage for recipe data (data is reset when the application restarts)</li>
                </ul>
                <p>
                  You can clear this data at any time through your browser settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Links</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  Recipe Helper may contain links to external websites (recipe sources, YouTube videos, etc.). 
                  We are not responsible for the privacy practices of these external sites.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changes to Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  We may update this privacy policy from time to time. Any changes will be posted on this page 
                  with an updated revision date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                <p>
                  If you have questions about this privacy policy, please contact us through the application 
                  or repository issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
