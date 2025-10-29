"use client"

import { Badge } from "@/components/ui/badge"
import type { GMBReview } from "@/lib/types/database"
import { ReviewCard } from "./review-card"

interface ReviewColumnProps {
  title: string
  status: "new" | "in_progress" | "responded"
  reviews: GMBReview[]
  onGenerateResponse: (reviewId: string) => void
  onReply: (reviewId: string) => void
}

export function ReviewColumn({ title, status, reviews, onGenerateResponse, onReply }: ReviewColumnProps) {
  const getStatusColor = () => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30"
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "responded":
        return "bg-green-500/20 text-green-500 border-green-500/30"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary/30">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge className={getStatusColor()}>{reviews.length}</Badge>
      </div>

      {/* Reviews List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No reviews</p>
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onGenerateResponse={onGenerateResponse} onReply={onReply} />
          ))
        )}
      </div>
    </div>
  )
}
