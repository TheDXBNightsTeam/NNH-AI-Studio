"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bell, Key, Users, CreditCard, Loader2 } from "lucide-react"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user } = useSupabase()
  const supabase = createClient()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState(user?.email || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState({
    newReviews: true,
    aiSuggestions: true,
    weeklyReports: false,
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      setIsLoading(true)
      try {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

        if (profile) {
          setFullName(profile.full_name || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  async function handleSaveProfile() {
    if (!user) return

    setIsSaving(true)
    const savePromise = supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)
      .then(({ error }) => {
        if (error) throw error
      })

    toast.promise(savePromise, {
      loading: "Saving profile...",
      success: "Profile updated successfully!",
      error: "Failed to update profile. Please try again.",
      finally: () => {
        setIsSaving(false)
      },
    })
  }

  const handleToggleNotification = (type: keyof typeof notificationPreferences) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
    toast.success(`${type === "newReviews" ? "New Reviews" : type === "aiSuggestions" ? "AI Suggestions" : "Weekly Reports"} notifications ${!notificationPreferences[type] ? "enabled" : "disabled"}`)
  }

  const handleGenerateAPIKey = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Generating API key...",
        success: "API key generated successfully! (This is a demo feature)",
        error: "Failed to generate API key",
      }
    )
  }

  const handleInviteTeamMember = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Sending invitation...",
        success: "Team invitation sent! (This is a demo feature)",
        error: "Failed to send invitation",
      }
    )
  }

  const handleManageSubscription = () => {
    toast.info("Redirecting to billing portal... (This is a demo feature)")
  }

  const handleChangeAvatar = () => {
    toast.info("Avatar upload feature coming soon!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-primary/30 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
          >
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-semibold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={handleChangeAvatar}
                  className="border-primary/30 text-foreground hover:bg-primary/20 bg-transparent"
                >
                  Change Avatar
                </Button>
              </div>

              {/* Form */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-secondary border-primary/30 text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-secondary border-primary/30 text-foreground opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Preferences</CardTitle>
              <CardDescription className="text-muted-foreground">Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-primary/20">
                  <div>
                    <p className="font-medium text-foreground">New Reviews</p>
                    <p className="text-sm text-muted-foreground">Get notified when you receive new reviews</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleNotification("newReviews")}
                    className={`border-primary/30 hover:bg-primary/20 bg-transparent ${notificationPreferences.newReviews ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {notificationPreferences.newReviews ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-primary/20">
                  <div>
                    <p className="font-medium text-foreground">AI Suggestions</p>
                    <p className="text-sm text-muted-foreground">Receive AI-generated response suggestions</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleNotification("aiSuggestions")}
                    className={`border-primary/30 hover:bg-primary/20 bg-transparent ${notificationPreferences.aiSuggestions ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {notificationPreferences.aiSuggestions ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-primary/20">
                  <div>
                    <p className="font-medium text-foreground">Weekly Reports</p>
                    <p className="text-sm text-muted-foreground">Get weekly performance summaries</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleNotification("weeklyReports")}
                    className={`border-primary/30 hover:bg-primary/20 bg-transparent ${notificationPreferences.weeklyReports ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {notificationPreferences.weeklyReports ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api">
          <Card className="bg-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-foreground">API Keys</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your API keys for integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  API keys allow you to integrate GMB Manager with your own applications and services.
                </p>
                <Button
                  onClick={handleGenerateAPIKey}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card className="bg-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-foreground">Team Management</CardTitle>
              <CardDescription className="text-muted-foreground">Invite and manage team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Collaborate with your team by inviting members to manage locations and reviews.
                </p>
                <Button
                  onClick={handleInviteTeamMember}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  Invite Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="bg-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-foreground">Billing & Usage</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary border border-primary/20">
                  <p className="font-medium text-foreground mb-1">Current Plan: Professional</p>
                  <p className="text-sm text-muted-foreground">$49/month - Unlimited locations and reviews</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="border-primary/30 text-foreground hover:bg-primary/20 bg-transparent"
                >
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
