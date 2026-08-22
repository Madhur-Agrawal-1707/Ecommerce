"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, Trash2 } from "lucide-react";
import { FormSection } from "@/components/admin/form-section";
import Image from "next/image";
import React from "react";

const schema = z.object({
  meta_title_template: z.string().min(1, "Title template is required"),
  default_meta_description: z.string().optional().nullable(),
  ga_tracking_id: z.string().optional().nullable(),
  fb_pixel_id: z.string().optional().nullable(),
  search_console_meta: z.string().optional().nullable(),
  robots_txt: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function GlobalSeoForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState<string>(initialData?.og_default_image_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      meta_title_template: initialData?.meta_title_template || "{Page Title} | {Site Name}",
      default_meta_description: initialData?.default_meta_description || "",
      ga_tracking_id: initialData?.ga_tracking_id || "",
      fb_pixel_id: initialData?.fb_pixel_id || "",
      search_console_meta: initialData?.search_console_meta || "",
      robots_txt: initialData?.robots_txt || "User-agent: *\nAllow: /",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `og_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('brand-assets').getPublicUrl(fileName);
    setOgImageUrl(data.publicUrl);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        og_default_image_url: ogImageUrl,
      };

      const { error } = await supabase.from("seo_settings").update(payload).eq("id", 1);
      if (error) throw error;
      toast.success("Global SEO settings saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <FormSection title="Meta Tags" description="Default meta information for pages without specific overrides.">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meta Title Template</label>
            <Input {...register("meta_title_template")} placeholder="{Page Title} | {Site Name}" />
            <p className="text-xs text-muted-foreground">Available variables: {'{Page Title}'}, {'{Site Name}'}</p>
            {errors.meta_title_template && <p className="text-sm text-destructive">{errors.meta_title_template.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Meta Description</label>
            <Textarea {...register("default_meta_description")} rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Default Open Graph (OG) Image</label>
            <p className="text-xs text-muted-foreground mb-2">Used when a page or product doesn't have a specific image.</p>
            {ogImageUrl ? (
              <div className="relative h-40 w-72 rounded-md border overflow-hidden group">
                <Image src={ogImageUrl} alt="OG preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button type="button" variant="destructive" size="sm" onClick={() => setOgImageUrl("")}>
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed rounded-md p-8 text-center bg-surface hover:bg-muted/50 transition-colors cursor-pointer w-72"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Upload Default OG Image</p>
                <p className="text-xs text-muted-foreground mt-1">1200x630 pixels</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            )}
            {isUploading && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-2"/> Uploading...</p>}
          </div>
        </div>
      </FormSection>

      <FormSection title="Tracking & Analytics" description="Insert third-party tracking IDs.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Analytics 4 (GA4) ID</label>
            <Input {...register("ga_tracking_id")} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Facebook Pixel ID</label>
            <Input {...register("fb_pixel_id")} placeholder="123456789012345" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Search Console & Crawlers" description="Manage crawler verification and robots.txt.">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Google Search Console Verification Meta</label>
            <Input {...register("search_console_meta")} placeholder="<meta name='google-site-verification' content='...' />" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Robots.txt Content</label>
            <Textarea {...register("robots_txt")} rows={6} className="font-mono text-sm" />
            <p className="text-xs text-muted-foreground">This content will be served at /robots.txt</p>
          </div>
        </div>
      </FormSection>
    </form>
  );
}
