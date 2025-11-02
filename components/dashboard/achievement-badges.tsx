"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Flame, Target, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface AchievementBadgesProps {
  achievements: Achievement[]
  streak?: number
}

const iconMap: Record<string, any> = {
  star: Star,
  flame: Flame,
  target: Target,
  trophy: Trophy,
}

export function AchievementBadges({ achievements, streak = 0 }: AchievementBadgesProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Card className="bg-card border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Achievements</CardTitle>
            <p className="text-xs text-muted-foreground">
              {unlockedCount}/{totalCount} unlocked
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-gradient-to-r from-warning/20 to-primary/20 border border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  🔥 {streak}-Day Streak
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep it up! Active for {streak} consecutive days
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {achievements.map((achievement, index) => {
            const IconComponent = iconMap[achievement.icon] || Star
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  achievement.unlocked
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary border-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    achievement.unlocked
                      ? "bg-primary/20"
                      : "bg-muted/20"
                  )}>
                    {achievement.unlocked ? (
                      <IconComponent className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium",
                        achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {achievement.title}
                      </p>
                      {achievement.unlocked && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-success/10 border-success/30 text-success"
                        >
                          Unlocked! 🎉
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1.5 bg-muted"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
