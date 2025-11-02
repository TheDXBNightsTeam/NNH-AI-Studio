"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, HelpCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Question {
  id: string
  location_name: string
  question: string
  answer?: string
  created_at: string
  answered_at?: string
}

export function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError("Unauthorized")
        return
      }

      // Note: Q&A API is deprecated but we can show placeholder
      // until we implement the replacement API
      const { data: locations } = await supabase
        .from("gmb_locations")
        .select("id, location_name")
        .eq("user_id", user.id)

      // TODO: Fetch actual Q&A data from Google API when available
      // For now, show empty state with message
      setQuestions([])
    } catch (err: any) {
      console.error("Error fetching questions:", err)
      setError(err.message || "Failed to fetch questions")
      toast.error("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-primary/30">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchQuestions} className="mt-4" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Questions & Answers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer questions and answers for your locations
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <Card className="bg-card border-primary/30">
          <CardContent className="p-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Questions Yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Questions from customers will appear here once they start asking about your business locations.
              You can answer questions directly from your Google Business Profile.
            </p>
            <p className="text-xs text-muted-foreground mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Note: Q&A API is deprecated. We're working on implementing the replacement API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id} className="bg-card border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{question.location_name}</CardTitle>
                    <CardDescription className="mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(question.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {question.answer ? (
                    <Badge variant="default" className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Answered
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground mb-2">Question:</p>
                  <p className="text-muted-foreground">{question.question}</p>
                </div>
                {question.answer && (
                  <div>
                    <p className="font-medium text-foreground mb-2">Answer:</p>
                    <p className="text-muted-foreground">{question.answer}</p>
                    {question.answered_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Answered on {new Date(question.answered_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

