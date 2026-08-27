import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalSeoForm } from "@/components/admin/seo/global-seo-form";
import { PageSeoList } from "@/components/admin/seo/page-seo-list";
import { AdvancedSeo } from "@/components/admin/seo/advanced-seo";

export const metadata = {
  title: "SEO Management | Admin Dashboard",
};

export default async function SeoPage() {
  const supabase = createClient();
  
  // Upsert or fetch global SEO settings (id=1)
  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("id", 1)
    .single();
  let settings = data;

  if (!settings && !error) {
    const { data: newSettings } = await supabase
      .from("seo_settings")
      .insert({ id: 1 })
      .select()
      .single();
    settings = newSettings;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
        <p className="text-muted-foreground">Control global meta tags, per-page overrides, and tracking scripts.</p>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList>
          <TabsTrigger value="global">Global SEO & Tracking</TabsTrigger>
          <TabsTrigger value="pages">Per-Page SEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="global" className="bg-card border rounded-md p-6">
          <GlobalSeoForm initialData={settings || {}} />
        </TabsContent>
        
        <TabsContent value="pages" className="bg-card border rounded-md p-6">
          <PageSeoList />
        </TabsContent>

        <TabsContent value="advanced" className="bg-card border rounded-md p-6">
          <AdvancedSeo />
        </TabsContent>
      </Tabs>
    </div>
  );
}
