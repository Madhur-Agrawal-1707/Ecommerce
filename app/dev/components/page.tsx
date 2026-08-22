"use client"

import * as React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { PackageOpen, AlertCircle } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

// Storefront Components
import { ProductCard } from "@/components/storefront/product-card"
import { EmptyState } from "@/components/storefront/empty-state"

// Admin Components
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DataTable } from "@/components/admin/data-table"
import { StatCard } from "@/components/admin/stat-card"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { FormSection, FormInput } from "@/components/admin/form-section"

// UI Primitives
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"

// Dummy Data for Table
const columns: ColumnDef<any>[] = [
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "status", header: "Status" },
]
const dummyData = [
  { sku: "SA-001", name: "Banarasi Silk Saree", stock: 15, status: "Active" },
  { sku: "SA-002", name: "Kanjeevaram Silk", stock: 0, status: "Out of Stock" },
  { sku: "SU-001", name: "Velvet Anarkali Suit", stock: 5, status: "Active" },
]

// Dummy Form Schema
const schema = z.object({
  title: z.string().min(3, "Title is too short"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Invalid price"),
})

export default function DevComponentsPage() {
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", price: "" }
  })

  const onSubmit = (data: any) => {
    toast.success("Form submitted successfully!")
    console.log(data)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* HEADER */}
      <div className="border-b border-border/50 bg-surface/50 p-6 sticky top-0 z-50 backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">Noir & Gold</h1>
          <p className="text-muted-foreground mt-1">Design System & Component Sandbox</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6 space-y-24 mt-8">
        
        {/* --- SECTION 1: PRIMITIVES --- */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl border-b border-primary/20 pb-2">1. shadcn/ui Primitives (Storefront Context)</h2>
            <p className="text-muted-foreground text-sm">Testing raw tokens in dark mode</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Buttons */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
              <h3 className="font-medium text-lg mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Link Button</Button>
                <Button variant="shimmer" className="w-full">Shimmer Button</Button>
              </div>
            </div>

            {/* Badges & Skeletons */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
              <h3 className="font-medium text-lg mb-4">Badges & Loading</h3>
              <div className="flex gap-4">
                <Badge variant="default">NEW</Badge>
                <Badge variant="destructive">SALE</Badge>
                <Badge variant="secondary">OUT OF STOCK</Badge>
                <Badge variant="success">PAID</Badge>
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </div>

            {/* Inputs & Controls */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
              <h3 className="font-medium text-lg mb-4">Forms & Controls</h3>
              <div className="space-y-6">
                <div className="relative">
                  <Input id="sandbox-input" placeholder=" " />
                  <Label htmlFor="sandbox-input">Floating Label</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="relative transform-none top-0 left-0">Accept terms and conditions</Label>
                </div>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one" className="relative transform-none top-0 left-0">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two" className="relative transform-none top-0 left-0">Option Two</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Dialogs & Accordions */}
            <div className="space-y-4 rounded-xl border border-border bg-surface p-6 md:col-span-2 lg:col-span-3">
              <h3 className="font-medium text-lg mb-4">Overlays & Disclosures</h3>
              <div className="flex gap-4 mb-8">
                <Dialog>
                  <DialogTrigger asChild><Button variant="outline">Open Quick View (Dialog)</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Quick View Modal</DialogTitle>
                    </DialogHeader>
                    <div className="h-32 bg-background rounded-md flex items-center justify-center text-muted-foreground">Dialog Content</div>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild><Button variant="outline">Open Cart (Sheet)</Button></SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Cart Drawer</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </SheetContent>
                </Sheet>
                
                <Button variant="outline" onClick={() => toast.success("This is a success toast!")}>Trigger Toast</Button>
              </div>

              <Accordion type="single" collapsible className="w-full max-w-lg">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Fabric & Care</AccordionTrigger>
                  <AccordionContent>Dry clean only. Do not bleach. Store in a cool, dry place.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                  <AccordionContent>Free shipping on orders over ₹5,000. Returns accepted within 7 days for unstitched items.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: STOREFRONT SHARED --- */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl border-b border-primary/20 pb-2">2. Storefront Shared Components</h2>
            <p className="text-muted-foreground text-sm">Product cards, empty states, and layout pieces</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="font-medium mb-4">Product Card (Hover me)</h3>
              <div className="max-w-[280px]">
                <ProductCard
                  id="prod-1"
                  slug="banarasi-silk-saree-gold"
                  title="Banarasi Silk Saree in Midnight Black & Gold"
                  price={12999}
                  salePrice={9999}
                  imageMain="https://images.unsplash.com/photo-1583391733959-f18305f62933?q=80&w=800&auto=format&fit=crop"
                  imageLifestyle="https://images.unsplash.com/photo-1610189013233-a64fb0db22e5?q=80&w=800&auto=format&fit=crop"
                  isNew={true}
                  stockQuantity={5}
                  onAddToCart={(id) => toast.success(`Added ${id} to cart`)}
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="font-medium mb-4">Empty State</h3>
              <EmptyState
                icon={PackageOpen}
                title="Your cart is empty"
                description="Looks like you haven't added anything to your cart yet. Discover our latest arrivals."
                actionLabel="Continue Shopping"
                onAction={() => toast("Redirecting to shop...")}
              />
            </div>
          </div>
        </section>
      </div>

      {/* --- SECTION 3: ADMIN SHARED (LIGHT THEME ENCLOSURE) --- */}
      <div className="admin bg-background text-foreground border-t border-primary/20 mt-16 pb-24">
        <div className="mx-auto max-w-7xl p-6 mt-8 space-y-8">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl border-b border-primary/20 pb-2">3. Admin Shared Components</h2>
            <p className="text-muted-foreground text-sm">Light ivory theme scope (`.admin` class active)</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Preview */}
            <div className="lg:col-span-1 border rounded-xl overflow-hidden h-[600px] shadow-sm">
              <AdminSidebar />
            </div>

            <div className="lg:col-span-3 space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Revenue" value="₹1,24,500" delta={12.5} deltaType="increase" />
                <StatCard title="Total Orders" value="142" delta={4.2} deltaType="decrease" />
                <StatCard title="Active Customers" value="89" />
              </div>

              {/* Data Table */}
              <div className="space-y-4">
                <h3 className="font-medium">Data Table (with Tanstack Table)</h3>
                <DataTable columns={columns} data={dummyData} searchKey="name" />
              </div>

              {/* Forms & Dialogs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-medium">Forms</h3>
                  <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                      <FormSection title="Product Basics" description="Main product details">
                        <FormInput name="title" label="Product Title" required />
                        <FormInput name="price" label="Price (₹)" type="number" required />
                        <Button type="submit" className="w-full">Save Details</Button>
                      </FormSection>
                    </form>
                  </FormProvider>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Destructive Actions</h3>
                  <div className="p-6 border rounded-xl bg-surface flex flex-col items-center justify-center min-h-[300px]">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                      Delete Product
                    </Button>
                    <ConfirmDialog
                      open={confirmOpen}
                      onOpenChange={setConfirmOpen}
                      title="Are you absolutely sure?"
                      description="This action cannot be undone. This will permanently delete the product and remove its data from our servers."
                      confirmText="Delete"
                      onConfirm={() => {
                        toast.error("Product deleted")
                        setConfirmOpen(false)
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
