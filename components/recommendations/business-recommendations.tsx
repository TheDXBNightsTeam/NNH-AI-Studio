"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Sparkles, MessageSquare, TrendingUp, Calendar, MapPin, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

interface Recommendation {
  id: string
  type: "post" | "review" | "profile" | "engagement"
  priority: "high" | "medium" | "low"
  title: string
  description: string
  action: string
  actionLink?: string
  category?: string
}

export function BusinessRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get active GMB accounts
      const { data: accounts } = await supabase
        .from("gmb_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)

      if (!accounts || accounts.length === 0) {
        setLoading(false)
        return
      }

      const accountIds = accounts.map((a) => a.id)

      // Get locations data
      const { data: locations } = await supabase
        .from("gmb_locations")
        .select("category, rating, review_count, location_name")
        .eq("user_id", user.id)
        .in("gmb_account_id", accountIds)

      // Get posts data
      const locationIds = locations?.map((l: any) => l.id) || []
      const { data: posts } =
        locationIds.length > 0
          ? await supabase
              .from("gmb_posts")
              .select("created_at, post_type")
              .eq("user_id", user.id)
              .in("location_id", locationIds)
          : { data: null }

      // Get reviews data
      const { data: reviews } =
        locationIds.length > 0
          ? await supabase
              .from("gmb_reviews")
              .select("rating, reply_text, created_at")
              .eq("user_id", user.id)
              .in("location_id", locationIds)
          : { data: null }

      const generatedRecommendations: Recommendation[] = []

      // Post recommendations
      if (posts) {
        const recentPosts = posts.filter((p: any) => {
          const postDate = new Date(p.created_at)
          const daysDiff = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysDiff <= 30
        }).length

        if (recentPosts === 0) {
          generatedRecommendations.push({
            id: "create-post",
            type: "post",
            priority: "high",
            title: "Create Your First Post",
            description: "Posts help keep your business visible and engage with customers. Share updates, offers, or events.",
            action: "Create Post",
            actionLink: "/gmb-dashboard?tab=posts",
            category: "Content",
          })
        } else if (recentPosts < 2) {
          generatedRecommendations.push({
            id: "increase-posts",
            type: "post",
            priority: "medium",
            title: "Post More Regularly",
            description: `You've posted ${recentPosts} times in the last 30 days. Regular posts (weekly) improve visibility and engagement.`,
            action: "Create Post",
            actionLink: "/gmb-dashboard?tab=posts",
            category: "Content",
          })
        }
      }

      // Review response recommendations
      if (reviews && reviews.length > 0) {
        const unrespondedReviews = reviews.filter((r: any) => !r.reply_text).length
        if (unrespondedReviews > 0) {
          generatedRecommendations.push({
            id: "respond-reviews",
            type: "review",
            priority: "high",
            title: "Respond to Unanswered Reviews",
            description: `You have ${unrespondedReviews} review${unrespondedReviews > 1 ? "s" : ""} without responses. Quick responses show you care and improve ratings.`,
            action: "View Reviews",
            actionLink: "/gmb-dashboard?tab=reviews",
            category: "Engagement",
          })
        }

        // Negative review responses
        const negativeUnresponded = reviews.filter((r: any) => r.rating <= 2 && !r.reply_text).length
        if (negativeUnresponded > 0) {
          generatedRecommendations.push({
            id: "respond-negative",
            type: "review",
            priority: "high",
            title: "Address Negative Reviews",
            description: `${negativeUnresponded} negative review${negativeUnresponded > 1 ? "s" : ""} need your attention. Professional responses can turn unhappy customers around.`,
            action: "Respond Now",
            actionLink: "/gmb-dashboard?tab=reviews",
            category: "Reputation",
          })
        }
      }

      // Profile optimization
      if (locations && locations.length > 0) {
        const categories = new Set(locations.map((l: any) => l.category).filter(Boolean))
        const hasMultipleCategories = categories.size > 1

        if (hasMultipleCategories) {
          generatedRecommendations.push({
            id: "optimize-categories",
            type: "profile",
            priority: "medium",
            title: "Optimize Business Categories",
            description: "Ensure each location has the most relevant primary category to improve search visibility.",
            action: "Update Categories",
            actionLink: "/gmb-dashboard?tab=locations",
            category: "SEO",
          })
        }

        // Check for locations with low review counts
        const lowReviewLocations = locations.filter((l: any) => (l.review_count || 0) < 5).length
        if (lowReviewLocations > 0) {
          generatedRecommendations.push({
            id: "encourage-reviews",
            type: "engagement",
            priority: "medium",
            title: "Encourage More Reviews",
            description: `${lowReviewLocations} location${lowReviewLocations > 1 ? "s have" : " has"} fewer than 5 reviews. More reviews improve local SEO and trust.`,
            action: "Learn How",
            category: "Growth",
          })
        }
      }

      // Seasonal recommendations
      const currentMonth = new Date().getMonth()
      const isHolidaySeason = currentMonth === 11 || currentMonth === 0 // December or January
      if (isHolidaySeason) {
        generatedRecommendations.push({
          id: "holiday-content",
          type: "post",
          priority: "low",
          title: "Create Holiday-Themed Posts",
          description: "Holiday posts attract more attention and engagement. Share special offers or seasonal greetings.",
          action: "Create Post",
          actionLink: "/gmb-dashboard?tab=posts",
          category: "Content",
        })
      }

      setRecommendations(generatedRecommendations.slice(0, 8)) // Limit to 8 recommendations
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      toast.error("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "post":
        return <Sparkles className="h-5 w-5 text-purple-500" />
      case "review":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "profile":
        return <MapPin className="h-5 w-5 text-green-500" />
      case "engagement":
        return <TrendingUp className="h-5 w-5 text-orange-500" />
    }
  }

  const getPriorityBadge = (priority: Recommendation["priority"]) => {
    const colors = {
      high: "bg-red-500/20 text-red-500 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      low: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    }
    return <Badge variant="outline" className={colors[priority]}>{priority.toUpperCase()}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <p className="text-muted-foreground">Actionable suggestions to improve your business presence</p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card className="border-primary/30">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Connect your GMB account to get personalized recommendations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-primary/30 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(rec.type)}
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                    </div>
                    {getPriorityBadge(rec.priority)}
                  </div>
                  {rec.category && (
                    <Badge variant="secondary" className="mt-2 w-fit">
                      {rec.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{rec.description}</CardDescription>
                  {rec.actionLink ? (
                    <Link href={rec.actionLink}>
                      <Button size="sm" className="w-full">
                        {rec.action}
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full">
                      {rec.action}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

