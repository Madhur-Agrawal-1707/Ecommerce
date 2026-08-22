"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Reviews } from "./reviews"

export function Accordions({ product }: { product: any }) {
  return (
    <div className="pt-6 border-t border-border mt-8">
      <Accordion type="single" collapsible defaultValue="description" className="w-full">
        {product.description && (
          <AccordionItem value="description" className="border-border">
            <AccordionTrigger className="text-foreground hover:text-gold hover:no-underline">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {product.description}
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="fabric-care" className="border-border">
          <AccordionTrigger className="text-foreground hover:text-gold hover:no-underline">
            Fabric & Care
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed space-y-2">
            {product.fabric && <p><strong>Fabric:</strong> {product.fabric}</p>}
            {product.wash_care && <p><strong>Wash Care:</strong> {product.wash_care}</p>}
            {!product.fabric && !product.wash_care && <p>Dry clean only recommended for premium ethnic wear.</p>}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping-returns" className="border-border">
          <AccordionTrigger className="text-foreground hover:text-gold hover:no-underline">
            Shipping & Returns
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed space-y-2">
            <p><strong>Shipping:</strong> Free standard shipping on all orders within India. Express shipping available at checkout.</p>
            <p><strong>Returns:</strong> 7-day easy return policy for unstitched/unaltered items. Stitched or custom-altered items are final sale.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reviews" className="border-border border-b-0">
          <AccordionTrigger className="text-foreground hover:text-gold hover:no-underline">
            Reviews
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <Reviews productId={product.id} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
