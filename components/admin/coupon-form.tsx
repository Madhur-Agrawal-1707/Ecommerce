"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/admin/form-section";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(0.01, "Value must be greater than 0"),
  min_order_amount: z.coerce.number().min(0).default(0),
  usage_limit: z.coerce.number().nullable().optional(),
  per_customer_limit: z.coerce.number().nullable().optional(),
  valid_from: z.string().optional().nullable(),
  valid_to: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
}).refine(data => {
  if (data.valid_from && data.valid_to) {
    return new Date(data.valid_to) > new Date(data.valid_from);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["valid_to"]
});

type FormData = z.infer<typeof couponSchema>;

export function CouponForm({ initialData }: { initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      code: initialData?.code || "",
      type: initialData?.type || "percentage",
      value: initialData?.value || 0,
      min_order_amount: initialData?.min_order_amount || 0,
      usage_limit: initialData?.usage_limit || null,
      per_customer_limit: initialData?.per_customer_limit || null,
      valid_from: initialData?.valid_from ? new Date(initialData.valid_from).toISOString().slice(0, 16) : "",
      valid_to: initialData?.valid_to ? new Date(initialData.valid_to).toISOString().slice(0, 16) : "",
      is_active: initialData?.is_active ?? true,
    },
  });

  const type = watch("type");
  const isActive = watch("is_active");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        usage_limit: data.usage_limit || null,
        per_customer_limit: data.per_customer_limit || null,
        valid_from: data.valid_from ? new Date(data.valid_from).toISOString() : null,
        valid_to: data.valid_to ? new Date(data.valid_to).toISOString() : null,
      };

      if (initialData?.id) {
        const { error } = await supabase.from("coupons").update(payload).eq("id", initialData.id);
        if (error) throw error;
        toast.success("Coupon updated successfully");
      } else {
        const { error } = await supabase.from("coupons").insert(payload);
        if (error) throw error;
        toast.success("Coupon created successfully");
      }

      router.push("/admin/coupons");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      <FormSection title="Basics" description="Identify the coupon code and discount amount.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input {...register("code")} placeholder="e.g. SUMMER20" className="uppercase" />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select 
              value={type} 
              onValueChange={(val: any) => setValue("type", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Value</label>
            <Input type="number" step="0.01" {...register("value")} placeholder="10" />
            {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Order Amount (₹)</label>
            <Input type="number" step="1" {...register("min_order_amount")} placeholder="0" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Limits & Validity" description="Control when and how this coupon can be used.">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Usage Limit</label>
            <Input type="number" {...register("usage_limit")} placeholder="Unlimited" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Limit Per Customer</label>
            <Input type="number" {...register("per_customer_limit")} placeholder="Unlimited" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Valid From</label>
            <Input type="datetime-local" {...register("valid_from")} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Valid To</label>
            <Input type="datetime-local" {...register("valid_to")} />
            {errors.valid_to && <p className="text-sm text-destructive">{errors.valid_to.message}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection title="Status" description="Enable or disable this coupon globally.">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="is_active" 
            checked={isActive} 
            onCheckedChange={(checked) => setValue("is_active", checked as boolean)} 
          />
          <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
            Active
          </label>
        </div>
      </FormSection>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}
