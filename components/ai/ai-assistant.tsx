"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Sparkles, Loader2, Lightbulb, TrendingUp, MessageSquare, MapPin, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AITip {
  id: string
  type: "insight" | "recommendation" | "warning"
  title: string
  message: string
  action?: string
  category?: string
}

export function AIAssistant() {
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(true)
  const [aiTips, setAiTips] = useState<AITip[]>([])
  const supabase = createClient()

  useEffect(() => {
    analyzeBusiness()
  }, [])

  const analyzeBusiness = async () => {
    setAnalyzing(true)
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
        setAiTips([
          {
            id: "1",
            type: "warning",
            title: "No GMB Account Connected",
            message: "Connect your Google My Business account to get personalized AI recommendations and insights.",
          },
        ])
        setAnalyzing(false)
        return
      }

      const accountIds = accounts.map((a) => a.id)

      // Get locations data
      const { data: locations } = await supabase
        .from("gmb_locations")
        .select("category, rating, review_count, address, location_name")
        .eq("user_id", user.id)
        .in("gmb_account_id", accountIds)

      // Get reviews data
      const locationIds = locations?.map((l: any) => l.id) || []
      const { data: reviews } =
        locationIds.length > 0
          ? await supabase
              .from("gmb_reviews")
              .select("rating, comment_text, ai_sentiment")
              .eq("user_id", user.id)
              .in("location_id", locationIds)
          : { data: null }

      // Analyze and generate tips
      const tips: AITip[] = []

      if (locations && locations.length > 0) {
        const avgRating = locations.reduce((sum, loc) => sum + (loc.rating || 0), 0) / locations.length
        const totalReviews = locations.reduce((sum, loc) => sum + (loc.review_count || 0), 0)

        // Rating insights
        if (avgRating < 4.0) {
          tips.push({
            id: "rating-low",
            type: "warning",
            title: "Average Rating Below 4.0",
            message: `Your average rating is ${avgRating.toFixed(1)}. Focus on improving customer service and addressing negative feedback to boost your rating.`,
            category: "Rating",
          })
        } else if (avgRating >= 4.5) {
          tips.push({
            id: "rating-high",
            type: "insight",
            title: "Excellent Rating",
            message: `Great job! Your average rating of ${avgRating.toFixed(1)} is excellent. Continue maintaining high-quality service.`,
            category: "Rating",
          })
        }

        // Review count insights
        if (totalReviews < 10) {
          tips.push({
            id: "reviews-few",
            type: "recommendation",
            title: "Increase Review Count",
            message: `You have ${totalReviews} reviews. Consider asking satisfied customers to leave reviews to build trust and improve local SEO.`,
            category: "Reviews",
            action: "Ask customers for reviews",
          })
        }

        // Category-specific insights
        const categories = new Set(locations.map((l: any) => l.category).filter(Boolean))
        if (categories.size > 0) {
          const categoryArray = Array.from(categories)
          tips.push({
            id: "category-insight",
            type: "insight",
            title: "Business Category Analysis",
            message: `Your business operates in: ${categoryArray.join(", ")}. Based on your category, consider posting updates about special offers, events, or seasonal promotions.`,
            category: "Category",
          })
        }
      }

      // Reviews sentiment analysis
      if (reviews && reviews.length > 0) {
        const negativeReviews = reviews.filter((r: any) => r.rating <= 2 || r.ai_sentiment === "negative").length
        if (negativeReviews > 0) {
          const negativePercent = ((negativeReviews / reviews.length) * 100).toFixed(1)
          tips.push({
            id: "negative-reviews",
            type: "warning",
            title: "Negative Reviews Detected",
            message: `${negativePercent}% of your reviews are negative. Prioritize responding to these reviews professionally and addressing concerns.`,
            category: "Reviews",
            action: "Respond to negative reviews",
          })
        }

        const unrespondedReviews = reviews.filter((r: any) => !r.reply_text).length
        if (unrespondedReviews > reviews.length * 0.2) {
          tips.push({
            id: "unresponded",
            type: "recommendation",
            title: "Review Response Rate",
            message: `${unrespondedReviews} reviews haven't been responded to. Responding to reviews shows engagement and improves customer perception.`,
            category: "Reviews",
            action: "Respond to reviews",
          })
        }
      }

      setAiTips(tips.slice(0, 5)) // Limit to 5 tips
    } catch (error) {
      console.error("Error analyzing business:", error)
      toast.error("Failed to analyze business data")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      // Call AI API to generate response
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `As an AI assistant for Google My Business management, help the user with: ${userMessage}. Provide helpful, actionable advice.`,
          tone: "helpful",
          contentType: "responses",
        }),
      })

      if (!response.ok) throw new Error("Failed to generate response")

      const data = await response.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.content }])
    } catch (error) {
      console.error("Error generating response:", error)
      toast.error("Failed to get AI response")
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTipIcon = (type: AITip["type"]) => {
    switch (type) {
      case "insight":
        return <Lightbulb className="h-4 w-4 text-primary" />
      case "recommendation":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getTipColor = (type: AITip["type"]) => {
    switch (type) {
      case "insight":
        return "bg-primary/10 border-primary/30 text-primary"
      case "recommendation":
        return "bg-blue-500/10 border-blue-500/30 text-blue-500"
      case "warning":
        return "bg-orange-500/10 border-orange-500/30 text-orange-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-muted-foreground">Get personalized help and insights for your business</p>
        </div>
      </div>

      {/* AI Tips Section */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Insights
          </CardTitle>
          <CardDescription>
            {analyzing ? "Analyzing your business data..." : "AI-powered insights based on your business profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyzing ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : aiTips.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {aiTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border ${getTipColor(tip.type)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getTipIcon(tip.type)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{tip.title}</h4>
                              {tip.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {tip.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground/80">{tip.message}</p>
                            {tip.action && (
                              <Button size="sm" variant="outline" className="mt-2">
                                {tip.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Connect your GMB account to get AI-powered insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Ask AI Anything
          </CardTitle>
          <CardDescription>Get instant help with managing your Google Business Profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] mb-4 pr-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation to get AI-powered assistance</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium text-foreground">Try asking:</p>
                    <ul className="space-y-1 text-left max-w-md mx-auto">
                      <li>• How can I improve my review response rate?</li>
                      <li>• What posts should I create for my business?</li>
                      <li>• How do I optimize my GMB profile?</li>
                    </ul>
                  </div>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary border border-primary/20"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary border border-primary/20 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about your business, reviews, posts, or anything else..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[60px] resize-none"
            />
            <Button onClick={handleSendMessage} disabled={loading || !input.trim()} size="lg">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

