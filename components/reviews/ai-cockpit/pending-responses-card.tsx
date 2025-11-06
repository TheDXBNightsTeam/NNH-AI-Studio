"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AICopilotStatus } from "./ai-copilot-status"
import { ReviewStreamList } from "./review-stream-list"
import { EmptyState } from "./empty-state"
import type { GMBReview } from "@/lib/types/database"
import { cn } from "@/lib/utils"

type FilterType = 'all' | 'needs_response' | 'responded'

interface PendingResponsesCardProps {
  reviews: (GMBReview & { location_name?: string })[]
  stats: {
    pending: number
    responseRate: number
    avgTime: number
    total?: number
    responded?: number
  }
  selectedReview?: GMBReview & { location_name?: string }
  onSelectReview: (review: GMBReview & { location_name?: string }) => void
  loading?: boolean
}

export function PendingResponsesCard({
  reviews,
  stats,
  selectedReview,
  onSelectReview,
  loading
}: PendingResponsesCardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  // Filter reviews based on active filter
  const filteredReviews = useMemo(() => {
    if (activeFilter === 'all') return reviews
    
    return reviews.filter(review => {
      const needsResponse = !review.has_reply && !review.has_response && !review.reply_text && !review.review_reply
      const hasReply = review.has_reply || review.has_response || review.reply_text || review.review_reply
      
      if (activeFilter === 'needs_response') return needsResponse
      if (activeFilter === 'responded') return hasReply
      return true
    })
  }, [reviews, activeFilter])

  // Calculate counts for filter buttons
  const needsResponseCount = reviews.filter(r => 
    !r.has_reply && !r.has_response && !r.reply_text && !r.review_reply
  ).length
  const respondedCount = reviews.filter(r => 
    r.has_reply || r.has_response || r.reply_text || r.review_reply
  ).length
  const allCount = reviews.length

  return (
    <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-white">Review Management</CardTitle>
        <CardDescription>Manage and respond to all customer reviews</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 min-h-0">
        <AICopilotStatus 
          status={loading ? "processing" : "ready"} 
          stats={stats} 
        />
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter('needs_response')}
            className={cn(
              "flex-1 border transition-colors",
              activeFilter === 'needs_response'
                ? "bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30"
                : "border-zinc-700 text-foreground hover:border-orange-500/50"
            )}
          >
            Needs Response ({needsResponseCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter('all')}
            className={cn(
              "flex-1 border transition-colors",
              activeFilter === 'all'
                ? "bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30"
                : "border-zinc-700 text-foreground hover:border-orange-500/50"
            )}
          >
            All ({allCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter('responded')}
            className={cn(
              "flex-1 border transition-colors",
              activeFilter === 'responded'
                ? "bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30"
                : "border-zinc-700 text-foreground hover:border-orange-500/50"
            )}
          >
            Responded ({respondedCount})
          </Button>
        </div>
        
        <div className="flex-1 min-h-0">
          <h4 className="text-sm font-semibold text-foreground mb-3">Review Stream</h4>
          <div className="text-xs text-muted-foreground mb-3">Priority Sorted</div>
          
          <div className="h-[400px]">
            <ReviewStreamList
              reviews={filteredReviews}
              selectedReviewId={selectedReview?.id}
              onSelectReview={onSelectReview}
              loading={loading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

