import { Star } from "lucide-react"

export function ProductInfo({ product }: { product: any }) {
  const hasDiscount = product.sale_price != null && product.sale_price < product.price

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">{product.title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-muted-foreground text-sm ml-2">(12 reviews)</span>
          </div>
          {product.sku && (
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              SKU: {product.sku}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-medium text-gold">
              ₹{product.sale_price.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
              ₹{product.price.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-2xl font-medium text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
        )}
      </div>

      {product.description && (
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Fabric & Craft details block */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-6 border-y border-border">
        {product.fabric && (
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Fabric</div>
            <div className="font-medium">{product.fabric}</div>
          </div>
        )}
        {product.work_type && (
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Craft</div>
            <div className="font-medium">{product.work_type}</div>
          </div>
        )}
        {product.saree_length_meters && (
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Length</div>
            <div className="font-medium">{product.saree_length_meters}m</div>
          </div>
        )}
        {product.blouse_included && product.blouse_included !== "none" && (
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Blouse</div>
            <div className="font-medium capitalize">{product.blouse_included}</div>
          </div>
        )}
        {product.wash_care && (
          <div className="col-span-2">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Wash Care</div>
            <div className="font-medium">{product.wash_care}</div>
          </div>
        )}
      </div>
    </div>
  )
}
