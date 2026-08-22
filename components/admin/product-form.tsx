"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { productSchema, type ProductFormValues } from "@/lib/validations/product"
import { createProduct, updateProduct } from "@/lib/actions/product"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaUploader } from "@/components/admin/media-uploader"
import { VariantBuilder } from "@/components/admin/variant-builder"

// In a real app, RichTextEditor, MediaUploader, VariantBuilder would be fully featured components.
// We mock them slightly here for the structure, then they can be expanded.

export function ProductForm({
  categories,
  initialData,
}: {
  categories: { id: string; name: string }[]
  initialData?: any
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const defaultValues: Partial<ProductFormValues> = initialData || {
    title: "",
    slug: "",
    status: "draft",
    price: 0,
    stock_quantity: 0,
    track_inventory: true,
    images: [],
    options: [],
    variants: [],
    tags: [],
    occasion: [],
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues,
  })

  function onSubmit(data: ProductFormValues) {
    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updateProduct(initialData.id, data)
          toast.success("Product updated successfully")
        } else {
          await createProduct(data)
          toast.success("Product created successfully")
          router.push("/admin/products")
        }
      } catch (error: any) {
        toast.error(error.message)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            {initialData ? "Edit Product" : "New Product"}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-gold text-black hover:bg-gold-bright">
              {isPending ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="flex flex-wrap h-auto overflow-x-auto justify-start border-b rounded-none bg-transparent space-x-2">
            <TabsTrigger value="basics" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Basics</TabsTrigger>
            <TabsTrigger value="fabric" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Fabric & Craft</TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Pricing</TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Inventory</TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Media</TabsTrigger>
            <TabsTrigger value="variants" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">Variants</TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:border-b-2 data-[state=active]:border-gold rounded-none bg-transparent shadow-none">SEO</TabsTrigger>
          </TabsList>

          <div className="p-6 bg-surface border border-border mt-2 rounded-md">
            {/* BASICS TAB */}
            <TabsContent value="basics" className="space-y-6 m-0">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Banarasi Silk Saree" {...field} onChange={e => {
                          field.onChange(e)
                          if (!initialData) {
                            form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                          }
                        }}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="banarasi-silk-saree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed product description..." className="min-h-[150px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* FABRIC TAB */}
            <TabsContent value="fabric" className="space-y-6 m-0">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fabric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabric</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pure Silk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="work_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Zari Woven" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="saree_length_meters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saree Length (Meters)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blouse_included"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blouse Included</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="unstitched">Unstitched</SelectItem>
                          <SelectItem value="stitched">Stitched</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* PRICING TAB */}
            <TabsContent value="pricing" className="space-y-6 m-0">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Price (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => {
                    const price = form.watch("price") || 0;
                    const salePrice = field.value || 0;
                    const hasDiscount = price > 0 && salePrice > 0 && salePrice < price;
                    const discountPercent = hasDiscount ? Math.round(((price - salePrice) / price) * 100) : 0;
                    const discountAmount = hasDiscount ? price - salePrice : 0;

                    return (
                      <FormItem>
                        <div className="flex items-end justify-between">
                          <FormLabel>Sale Price (₹)</FormLabel>
                          {hasDiscount && (
                            <span className="text-xs font-medium text-green-600">
                              You save ₹{discountAmount} ({discountPercent}%)
                            </span>
                          )}
                        </div>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </TabsContent>

            {/* INVENTORY TAB */}
            <TabsContent value="inventory" className="space-y-6 m-0">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="track_inventory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Track inventory</FormLabel>
                        <FormDescription>Automatically update stock when orders are placed.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            {/* MEDIA, VARIANTS, SEO */}
            <TabsContent value="media" className="space-y-6 m-0">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <MediaUploader images={field.value} setImages={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="variants" className="space-y-6 m-0">
              <VariantBuilder 
                options={form.watch("options")} 
                setOptions={(opts) => form.setValue("options", opts)}
                variants={form.watch("variants")}
                setVariants={(vars) => form.setValue("variants", vars)}
              />
            </TabsContent>

            <TabsContent value="seo" className="space-y-6 m-0">
              <FormField
                control={form.control}
                name="meta_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="SEO Title..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meta_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="SEO Description..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  )
}
