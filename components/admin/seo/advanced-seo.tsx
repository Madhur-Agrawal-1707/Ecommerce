"use client";

import { ExternalLink } from "lucide-react";

export function AdvancedSeo() {
  const dummyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Noir & Gold",
    "url": "https://noirgoldsarees.com",
    "logo": "https://noirgoldsarees.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 98765 43210",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://instagram.com/noir_and_gold",
      "https://facebook.com/noirandgold"
    ]
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium mb-4">Sitemap Status</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The sitemap is automatically generated at `/sitemap.xml` based on active products, categories, and custom pages.
        </p>
        <a 
          href="/sitemap.xml" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-primary hover:underline font-medium"
        >
          View live sitemap.xml <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Structured Data Preview (JSON-LD)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This is an example of the Organization schema that is injected into the homepage based on your Global Settings.
        </p>
        <div className="bg-muted rounded-md p-4 overflow-auto">
          <pre className="text-xs font-mono text-muted-foreground">
            {JSON.stringify(dummyJsonLd, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
