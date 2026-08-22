"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteProduct } from "@/lib/actions/product"
import { toast } from "sonner"

export type ProductColumn = {
  id: string
  title: string
  sku: string | null
  price: number
  stock_quantity: number
  status: "draft" | "active"
  category_name: string
  featured_image: string | null
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "featured_image",
    header: "Image",
    cell: ({ row }) => {
      const img = row.original.featured_image
      return (
        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative">
          {img ? (
            <Image src={img} alt={row.original.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No img
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category_name",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(price)
      return formatted
    },
  },
  {
    accessorKey: "stock_quantity",
    header: "Stock",
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock_quantity"))
      return (
        <Badge variant={stock > 10 ? "outline" : stock > 0 ? "secondary" : "destructive"}>
          {stock} in stock
        </Badge>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "active" ? "default" : "secondary"} className={status === "active" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete this product?")) {
                  try {
                    await deleteProduct(product.id)
                    toast.success("Product deleted successfully")
                  } catch (e: any) {
                    toast.error(e.message)
                  }
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
