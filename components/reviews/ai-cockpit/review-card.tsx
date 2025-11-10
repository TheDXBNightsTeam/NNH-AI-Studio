"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle2 } from "lucide-react"
import type { GMBReview } from "@/lib/types/database"
import { motion } from "framer-motion"
import { useState } from "react"

interface ReviewCardProps {
  review: GMBReview & { location_name?: string }
  isSelected?: boolean
  onClick: () => void
}

export function ReviewCard({ review, isSelected, onClick }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullReply, setShowFullReply] = useState(false)
  const reviewText = review.review_text || ""
  const shouldTruncate = reviewText.length > 150
  const displayText = shouldTruncate && !isExpanded 
    ? reviewText.substring(0, 150) + "..." 
    : reviewText
  
  // Check if review needs response
  const needsResponse = !review.has_reply && !review.has_response && !review.reply_text && !review.review_reply
  const hasReply = review.has_reply || review.has_response || review.reply_text || review.review_reply
  const replyText = review.reply_text || review.review_reply || review.response_text || ""
  const replyPreview = replyText.length > 100 ? replyText.substring(0, 100) + "..." : replyText
  
  // Get priority color based on rating
  const getPriorityColor = () => {
    if (needsResponse) return "border-l-4 border-l-orange-500"
    if (review.rating <= 2) return "border-l-4 border-l-red-500"
    if (review.rating === 3) return "border-l-4 border-l-yellow-500"
    return "border-l-4 border-l-green-500"
  }

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return '1 day ago'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      return `${Math.floor(diffDays / 30)} months ago`
    } catch {
      return ''
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`bg-zinc-900 border transition-colors cursor-pointer ${getPriorityColor()} ${
          isSelected 
            ? "border-orange-500 shadow-lg shadow-orange-500/20" 
            : needsResponse
            ? "border-orange-500/50 hover:border-orange-500"
            : "border-zinc-800 hover:border-orange-500/50"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 border-2 border-zinc-700">
                <AvatarFallback className="bg-zinc-800 text-orange-500 font-semibold">
                  {review.reviewer_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{review.reviewer_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating 
                            ? review.rating >= 4
                              ? "fill-green-500 text-green-500"
                              : review.rating <= 2
                              ? "fill-red-500 text-red-500"
                              : "fill-yellow-500 text-yellow-500"
                            : "text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.review_date || review.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasReply && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              {review.ai_sentiment && (
                <Badge className={getSentimentColor(review.ai_sentiment)}>
                  {review.ai_sentiment}
                </Badge>
              )}
            </div>
          </div>

          {/* Review Text */}
          {reviewText && (
            <p className="text-sm text-foreground/90 leading-relaxed">
              {displayText}
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="ml-1 text-orange-500 hover:text-orange-400 font-medium"
                >
                  {isExpanded ? " read less" : " read more"}
                </button>
              )}
            </p>
          )}

          {/* Reply Preview */}
          {hasReply && replyText && (
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-500">Your Reply:</span>
              </div>
              <p className="text-xs text-foreground/80">
                {showFullReply ? replyText : replyPreview}
                {replyText.length > 100 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullReply(!showFullReply)
                    }}
                    className="ml-1 text-orange-500 hover:text-orange-400 font-medium"
                  >
                    {showFullReply ? " Show Less" : " View Full"}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Location */}
          {review.location_name && (
            <div className="text-xs text-muted-foreground">
              📍 {review.location_name}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

