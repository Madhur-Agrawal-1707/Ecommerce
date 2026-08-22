"use client"

import * as React from "react"
import { Star, CheckCircle, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EmptyState } from "@/components/storefront/empty-state"

export function Reviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchReviews() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          title,
          body,
          created_at,
          is_verified,
          profiles(full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (data) {
        setReviews(data)
      }
      setLoading(false)
    }
    fetchReviews()
  }, [productId])

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="Be the first to review this product"
      />
    )
  }

  const average = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
  const total = reviews.length
  
  const distribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Summary */}
        <div className="flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-lg min-w-[200px]">
          <div className="text-4xl font-serif text-gold mb-2">{average.toFixed(1)}</div>
          <div className="flex items-center text-gold mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-4 h-4 ${star <= Math.round(average) ? 'fill-current' : 'text-muted-foreground'}`} />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">Based on {total} reviews</div>
        </div>

        {/* Bars */}
        <div className="flex-1 w-full space-y-2">
          {distribution.map((dist) => (
            <div key={dist.stars} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-12">{dist.stars} Stars</div>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold"
                  style={{ width: `${(dist.count / total) * 100}%` }}
                />
              </div>
              <div className="w-8 text-right">{dist.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-foreground flex items-center gap-2">
                  {review.profiles?.full_name || "Anonymous"}
                  {review.is_verified && <CheckCircle className="w-3 h-3 text-gold" />}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="flex items-center text-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-current' : 'text-muted-foreground'}`} />
                ))}
              </div>
            </div>
            {review.title && <h4 className="font-medium mt-3">{review.title}</h4>}
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {review.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
