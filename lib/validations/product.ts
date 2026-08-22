import * as z from "zod"

export const productVariantSchema = z.object({
  id: z.string().optional(), // For existing variants
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  stock_quantity: z.coerce.number().int().min(0, "Stock must be >= 0"),
  option_values: z.record(z.string(), z.string()).default({}),
})

export const productOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
})

export const productImageSchema = z.object({
  id: z.string().optional(),
  image_url: z.string().url(),
  alt_text: z.string().optional(),
  image_type: z.enum(["front", "back", "detail", "blouse", "model"]).optional(),
  sort_order: z.number().int().default(0),
})

export const productSchema = z.object({
  // Basics
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "active"]).default("draft"),
  
  // Fabric & Craft
  fabric: z.string().optional(),
  work_type: z.string().optional(),
  occasion: z.array(z.string()).default([]),
  saree_length_meters: z.coerce.number().positive().optional().nullable(),
  blouse_included: z.enum(["none", "unstitched", "stitched"]).optional().nullable(),
  wash_care: z.string().optional(),
  
  // Pricing
  price: z.coerce.number().positive("Price must be greater than 0"),
  sale_price: z.coerce.number().nonnegative().optional().nullable(),
  sale_start: z.string().optional().nullable(), // ISO date string
  sale_end: z.string().optional().nullable(),   // ISO date string
  
  // Inventory
  sku: z.string().optional().nullable(),
  stock_quantity: z.coerce.number().int().nonnegative().default(0),
  track_inventory: z.boolean().default(true),
  allow_backorders: z.boolean().default(false),
  
  // SEO
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  og_image_url: z.string().url().optional().or(z.literal('')),
  
  // Relations
  images: z.array(productImageSchema).default([]),
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
}).refine(data => {
  if (data.sale_price != null && data.sale_price >= data.price) {
    return false
  }
  return true
}, {
  message: "Sale price must be less than regular price",
  path: ["sale_price"]
}).refine(data => {
  if (data.sale_start && data.sale_end) {
    return new Date(data.sale_end) > new Date(data.sale_start)
  }
  return true
}, {
  message: "Sale end date must be after sale start date",
  path: ["sale_end"]
})

export type ProductFormValues = z.infer<typeof productSchema>
export type ProductVariant = z.infer<typeof productVariantSchema>
export type ProductOption = z.infer<typeof productOptionSchema>
export type ProductImage = z.infer<typeof productImageSchema>
