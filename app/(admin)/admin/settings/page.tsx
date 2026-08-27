import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSlidesTab } from "@/components/admin/hero-slides-tab";
import { ShippingMethodsTab } from "@/components/admin/shipping-methods-tab";

export const metadata = {
  title: "Brand & Site Settings | Admin Dashboard",
};

export default async function SettingsPage() {
  const supabase = createClient();
  
  // Upsert or fetch site settings (id=1)
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  let settings = data;

  if (!settings && !error) {
    // If not exists, create the default record
    const { data: newSettings } = await supabase
      .from("site_settings")
      .insert({ id: 1 })
      .select()
      .single();
    settings = newSettings;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brand & Site Settings</h1>
        <p className="text-muted-foreground">Manage your store's identity, contact details, and global preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="hero-slides">Hero Slides</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="bg-card border rounded-md p-6">
          <SettingsForm initialData={settings || {}} />
        </TabsContent>
        
        <TabsContent value="hero-slides" className="bg-card border rounded-md p-6">
          <HeroSlidesTab />
        </TabsContent>

        <TabsContent value="shipping" className="bg-card border rounded-md p-6">
          <ShippingMethodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
