"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/admin/form-section";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  site_name: z.string().min(1),
  tagline: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  logo_inverted_url: z.string().optional().nullable(),
  favicon_url: z.string().optional().nullable(),
  
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  business_address: z.string().optional().nullable(),
  
  currency_code: z.string().min(1),
  currency_symbol: z.string().min(1),
  tax_rate: z.coerce.number().min(0),
  tax_inclusive: z.boolean(),
  
  announcement_bar_active: z.boolean(),
  announcement_bar_text: z.string().optional().nullable(),
  announcement_bar_link: z.string().optional().nullable(),
  announcement_bar_color: z.string().optional().nullable(),
  
  social_instagram: z.string().optional().nullable(),
  social_facebook: z.string().optional().nullable(),
  social_pinterest: z.string().optional().nullable(),
  social_youtube: z.string().optional().nullable(),
  
  blouse_stitching_enabled: z.boolean(),
  blouse_stitching_charge: z.coerce.number().min(0),
  blouse_stitching_days: z.coerce.number().min(0),
});

type FormData = z.infer<typeof settingsSchema>;

export function SettingsForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      ...initialData,
      tax_rate: initialData.tax_rate || 0,
      blouse_stitching_charge: initialData.blouse_stitching_charge || 0,
      blouse_stitching_days: initialData.blouse_stitching_days || 5,
    },
  });

  const taxInclusive = watch("tax_inclusive");
  const announcementActive = watch("announcement_bar_active");
  const blouseEnabled = watch("blouse_stitching_enabled");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("site_settings").update(data).eq("id", 1);
      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>

      <FormSection title="Branding" description="Logos, site name, and identity.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Name</label>
            <Input {...register("site_name")} />
            {errors.site_name && <p className="text-sm text-destructive">{errors.site_name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <Input {...register("tagline")} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo URL</label>
            <Input {...register("logo_url")} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Inverted Logo URL</label>
            <Input {...register("logo_inverted_url")} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Favicon URL</label>
            <Input {...register("favicon_url")} placeholder="https://..." />
          </div>
        </div>
      </FormSection>

      <FormSection title="Contact Info" description="Business address and customer support details.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input type="email" {...register("contact_email")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input {...register("contact_phone")} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Business Address</label>
          <Textarea {...register("business_address")} />
        </div>
      </FormSection>

      <FormSection title="Announcement Bar" description="Show a message at the top of the storefront.">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="announcement_bar_active" 
            checked={announcementActive} 
            onCheckedChange={(checked) => setValue("announcement_bar_active", checked as boolean)} 
          />
          <label htmlFor="announcement_bar_active" className="text-sm font-medium cursor-pointer">
            Enable Announcement Bar
          </label>
        </div>
        {announcementActive && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message Text</label>
              <Input {...register("announcement_bar_text")} placeholder="Free shipping on orders over ₹5000!" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link URL (Optional)</label>
              <Input {...register("announcement_bar_link")} placeholder="/products" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Background Color (Hex)</label>
              <Input {...register("announcement_bar_color")} placeholder="#000000" />
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Social Links" description="Links to your social media profiles.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Instagram URL</label>
            <Input {...register("social_instagram")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Facebook URL</label>
            <Input {...register("social_facebook")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pinterest URL</label>
            <Input {...register("social_pinterest")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">YouTube URL</label>
            <Input {...register("social_youtube")} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Currency & Tax" description="Configure pricing display and tax rules.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency Code</label>
            <Input {...register("currency_code")} placeholder="INR" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency Symbol</label>
            <Input {...register("currency_symbol")} placeholder="₹" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tax Rate (%)</label>
            <Input type="number" step="0.01" {...register("tax_rate")} />
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="tax_inclusive" 
            checked={taxInclusive} 
            onCheckedChange={(checked) => setValue("tax_inclusive", checked as boolean)} 
          />
          <label htmlFor="tax_inclusive" className="text-sm font-medium cursor-pointer">
            Prices are tax-inclusive
          </label>
        </div>
      </FormSection>

      <FormSection title="Blouse Stitching Service" description="Configure the blouse stitching addon for sarees.">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="blouse_stitching_enabled" 
            checked={blouseEnabled} 
            onCheckedChange={(checked) => setValue("blouse_stitching_enabled", checked as boolean)} 
          />
          <label htmlFor="blouse_stitching_enabled" className="text-sm font-medium cursor-pointer">
            Enable Blouse Stitching Service
          </label>
        </div>
        {blouseEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Extra Charge (₹)</label>
              <Input type="number" step="1" {...register("blouse_stitching_charge")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Turnaround Time (Days)</label>
              <Input type="number" step="1" {...register("blouse_stitching_days")} />
            </div>
          </div>
        )}
      </FormSection>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
