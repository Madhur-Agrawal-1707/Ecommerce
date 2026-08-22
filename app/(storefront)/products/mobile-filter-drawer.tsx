"use client"

import * as React from "react"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { FilterSidebar } from "./filter-sidebar"

export function MobileFilterDrawer() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] px-4 pt-6 pb-10 rounded-t-xl overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle>Filters & Sort</SheetTitle>
        </SheetHeader>
        <FilterSidebar />
      </SheetContent>
    </Sheet>
  )
}
