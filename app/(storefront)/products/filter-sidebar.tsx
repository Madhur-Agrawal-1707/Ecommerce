"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

const FILTERS = {
  fabric: ["Banarasi", "Silk", "Cotton", "Georgette", "Chiffon", "Organza", "Linen"],
  occasion: ["Wedding", "Festive", "Party", "Casual", "Office"],
}

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    
    // Toggle logic for multiple selection (simplified to single for now, or toggle)
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("sort", value)
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-serif text-lg text-foreground mb-4">Sort By</h3>
        <select
          className="w-full bg-surface border border-border text-foreground text-sm rounded-md px-3 py-2 focus:ring-1 focus:ring-gold outline-none shadow-emboss transition-shadow"
          value={searchParams?.get("sort") || "newest"}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      <Accordion type="multiple" defaultValue={["fabric", "occasion"]} className="w-full">
        {Object.entries(FILTERS).map(([key, options]) => (
          <AccordionItem key={key} value={key} className="border-border">
            <AccordionTrigger className="text-foreground hover:text-gold capitalize text-sm font-semibold">
              {key}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pt-2">
                {options.map((option) => {
                  const isActive = searchParams?.get(key) === option.toLowerCase()
                  return (
                    <button
                      key={option}
                      onClick={() => handleFilter(key, option.toLowerCase())}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors text-left group"
                    >
                      <div className={cn(
                        "w-4 h-4 border rounded-sm flex items-center justify-center transition-colors shadow-pressed",
                        isActive ? "bg-gold border-gold" : "border-border group-hover:border-gold"
                      )}>
                        {isActive && <Check className="w-3 h-3 text-black" />}
                      </div>
                      {option}
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {(searchParams?.get("fabric") || searchParams?.get("occasion")) && (
        <Button 
          variant="outline" 
          onClick={() => {
            const params = new URLSearchParams(searchParams?.toString() || "")
            params.delete("fabric")
            params.delete("occasion")
            router.replace(`/products?${params.toString()}`, { scroll: false })
          }}
          className="text-gold border-gold hover:bg-gold/10 hover:text-gold-bright"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
