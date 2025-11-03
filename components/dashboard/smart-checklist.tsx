"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Sparkles, Clock, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface ChecklistTask {
  id: string
  title: string
  completed: boolean
  description?: string
  impact?: string
  estimatedMinutes?: number
  actionLabel?: string
  actionUrl?: string
  aiSuggestion?: string
  locked?: boolean
}

interface SmartChecklistProps {
  tasks: ChecklistTask[]
  onTaskAction?: (taskId: string) => void
}

export function SmartChecklist({ tasks, onTaskAction }: SmartChecklistProps) {
  const [collapsed, setCollapsed] = useState(false)
  
  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  
  const allCompleted = completedCount === totalCount

  if (allCompleted && collapsed) {
    return (
      <Card className="bg-card border-success/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm font-semibold text-success">
                All tasks completed! 🎉
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(false)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Get Started</CardTitle>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{totalCount} completed ({progressPercent}%)
              </p>
            </div>
          </div>
          {allCompleted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(true)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  task.completed
                    ? "bg-success/5 border-success/30"
                    : task.locked
                    ? "bg-muted/20 border-muted/30 opacity-60"
                    : "bg-secondary border-primary/20 hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : task.locked ? (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          task.completed ? "text-success line-through" : "text-foreground"
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {!task.completed && !task.locked && task.actionLabel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/40 text-sm font-medium h-8 px-4 hover:scale-105 transition-transform hover:shadow-lg hover:shadow-primary/20"
                          onClick={() => onTaskAction?.(task.id)}
                        >
                          {task.actionLabel}
                        </Button>
                      )}
                    </div>
                    
                    {!task.completed && !task.locked && (
                      <div className="flex items-center gap-3 flex-wrap text-xs">
                        {task.impact && (
                          <div className="flex items-center gap-1 text-primary">
                            <TrendingUp className="h-3 w-3" />
                            <span>{task.impact}</span>
                          </div>
                        )}
                        {task.estimatedMinutes && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedMinutes} min</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {task.aiSuggestion && !task.completed && !task.locked && (
                      <div className="flex items-start gap-2 p-2 rounded bg-primary/5 border border-primary/20">
                        <Sparkles className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {task.aiSuggestion}
                        </p>
                      </div>
                    )}
                    
                    {task.locked && (
                      <Badge variant="outline" className="text-xs border-muted">
                        🔒 Complete previous tasks to unlock
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
