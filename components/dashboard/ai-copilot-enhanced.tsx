"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, AlertCircle, Target, Lightbulb, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AIRecommendation {
  id: string
  priority: "high" | "medium" | "low"
  type: "review" | "photos" | "hours" | "post" | "info" | "general"
  message: string
  actionLabel: string
  actionUrl?: string
  onAction?: () => void
}

interface AICopilotEnhancedProps {
  recommendations: AIRecommendation[]
  mainMessage?: string
  onMainAction?: () => void
  mainActionLabel?: string
}

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    label: "High Priority"
  },
  medium: {
    icon: Target,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    label: "Medium Priority"
  },
  low: {
    icon: Lightbulb,
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    label: "Quick Win"
  }
}

export function AICopilotEnhanced({ 
  recommendations, 
  mainMessage,
  onMainAction,
  mainActionLabel 
}: AICopilotEnhancedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const highPriority = recommendations.filter(r => r.priority === "high")
  const mediumPriority = recommendations.filter(r => r.priority === "medium")
  const lowPriority = recommendations.filter(r => r.priority === "low")

  return (
    <Card className="bg-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <p className="text-xs text-muted-foreground">
              Smart recommendations for you
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mainMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-primary/10 border border-primary/30"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {mainMessage}
                </p>
                {mainActionLabel && onMainAction && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={onMainAction}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {mainActionLabel}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary/30"
                    >
                      Later
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="border-t border-primary/20 pt-3 space-y-3">
          {highPriority.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-xs font-semibold text-destructive">
                  High Priority
                </p>
              </div>
              {highPriority.map((rec, index) => (
                <RecommendationItem
                  key={rec.id}
                  recommendation={rec}
                  index={index}
                />
              ))}
            </div>
          )}

          {mediumPriority.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-warning" />
                <p className="text-xs font-semibold text-warning">
                  Recommended
                </p>
              </div>
              {mediumPriority.map((rec, index) => (
                <RecommendationItem
                  key={rec.id}
                  recommendation={rec}
                  index={index}
                />
              ))}
            </div>
          )}

          {lowPriority.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-info" />
                <p className="text-xs font-semibold text-info">
                  Quick Wins
                </p>
              </div>
              {lowPriority.map((rec, index) => (
                <RecommendationItem
                  key={rec.id}
                  recommendation={rec}
                  index={index}
                />
              ))}
            </div>
          )}

          {recommendations.length === 0 && !mainMessage && (
            <div className="text-center py-6">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                All caught up! No recommendations right now.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RecommendationItem({ 
  recommendation, 
  index 
}: { 
  recommendation: AIRecommendation
  index: number 
}) {
  const config = priorityConfig[recommendation.priority]
  const Icon = config.icon
  const router = useRouter()

  const handleClick = () => {
    if (recommendation.actionUrl) {
      router.push(recommendation.actionUrl)
    } else if (recommendation.onAction) {
      recommendation.onAction()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-3 rounded-lg border transition-all hover:shadow-sm hover:shadow-primary/20",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
        <div className="flex-1 space-y-2">
          <p className="text-sm text-foreground">
            {recommendation.message}
          </p>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-9 text-sm font-medium hover:scale-105 transition-transform",
              config.bgColor,
              config.borderColor,
              "hover:bg-primary/20 hover:border-primary/50"
            )}
            onClick={handleClick}
          >
            {recommendation.actionLabel}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
