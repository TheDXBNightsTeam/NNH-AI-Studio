"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { LocationsList } from "@/components/locations/locations-list"
import { ReviewsList } from "@/components/reviews/reviews-list"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { GMBSettings } from "@/components/settings/gmb-settings"
import { GMBDashboardSidebar } from "@/components/dashboard/gmb-sidebar"
import { MapPin, MessageSquare, Star, TrendingUp, AlertCircle, Users, Bell, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, Sparkles, Calendar, Image as ImageIcon, Loader2, Send, Timer, Wand2, Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface DashboardStats {
  totalLocations: number
  totalReviews: number
  averageRating: string
  responseRate: number
}

type LocationItem = { id: string; location_name: string }

// GMB Posts Section Component
function GMBPostsSection() {
  const supabase = createClient()
  const [locations, setLocations] = useState<LocationItem[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [cta, setCta] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [schedule, setSchedule] = useState<string>("")
  const [genLoading, setGenLoading] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [listLoading, setListLoading] = useState(true)
  
  // Templates
  const templates = [
    { id: 'promo', label: 'Promotion', content: '🎉 Special Offer! Limited time only - visit us today for exclusive deals. Don\'t miss out!' },
    { id: 'event', label: 'Event', content: '📅 Join us for our upcoming event! Mark your calendars and be part of something special.' },
    { id: 'update', label: 'Update', content: '📢 Important update: We have news to share with our valued customers. Stay informed!' },
    { id: 'holiday', label: 'Holiday', content: '🎄 Season\'s Greetings! Wishing you joy and happiness. Special holiday hours in effect.' }
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        return data.url
      }
    } catch (error) {
      console.error('Image upload error:', error)
    }
    return null
  }

  const handleGenerate = async () => {
    try {
      setGenLoading(true)
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'gmb', prompt: content || title, tone: 'friendly' })
      })
      const j = await res.json()
      if (j?.title) setTitle(j.title)
      if (j?.description) setContent(j.description)
    } catch (e:any) {
      toast.error(e.message)
    } finally {
      setGenLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("gmb_locations")
        .select("id, location_name")
        .eq("user_id", user.id)
        .order("location_name")
      setLocations((data ?? []) as any)
      setLoading(false)
      // fetch posts
      try {
        const res = await fetch('/api/gmb/posts/list')
        const j = await res.json()
        if (res.ok) setPosts(j.items || [])
      } finally {
        setListLoading(false)
      }
    })()
  }, [])

  const handleSave = async () => {
    if (selectedLocations.length === 0 || !content.trim()) {
      toast.error("Please select at least one location and add content")
      return
    }
    
    try {
      setSaving(true)
      
      // Upload image if selected
      let uploadedMediaUrl = mediaUrl
      if (imageFile) {
        const url = await uploadImage(imageFile)
        if (url) uploadedMediaUrl = url
      }
      
      // Save post for each selected location
      const savePromises = selectedLocations.map(locationId =>
        fetch("/api/gmb/posts/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId,
            title: title || undefined,
            content,
            mediaUrl: uploadedMediaUrl || undefined,
            callToAction: cta || undefined,
            callToActionUrl: ctaUrl || undefined,
            scheduledAt: schedule || undefined,
          }),
        })
      )
      
      const responses = await Promise.all(savePromises)
      const results = await Promise.all(responses.map(r => r.json()))
      
      const successful = responses.filter(r => r.ok).length
      if (successful > 0) {
        toast.success(`Post saved for ${successful} location(s)`)
        // Return the first post ID for publishing
        return results.find(r => r.post?.id)?.post?.id
      } else {
        throw new Error("Failed to save posts")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (selectedLocations.length === 0 || !content.trim()) {
      toast.error("Please select at least one location and add content")
      return
    }
    
    // Save first then publish
    const postId = await handleSave()
    if (!postId) return
    
    try {
      const res = await fetch('/api/gmb/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to publish')
      toast.success('Published to Google successfully')
      // Clear form after publish
      setTitle("")
      setContent("")
      setMediaUrl("")
      setImageFile(null)
      setImagePreview("")
      setCta("")
      setCtaUrl("")
      setSchedule("")
      setSelectedLocations([])
      // refresh list
      const r = await fetch('/api/gmb/posts/list'); const jj = await r.json(); if (r.ok) setPosts(jj.items||[])
    } catch (e:any) {
      toast.error(e.message)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch('/api/gmb/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Post deleted')
      const r = await fetch('/api/gmb/posts/list'); const jj = await r.json(); if (r.ok) setPosts(jj.items||[])
    } catch (e:any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Post History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="border border-primary/20 glass-strong">
            <CardHeader>
              <CardTitle>Create GMB Post</CardTitle>
              <CardDescription>Create and publish posts to your Business Profile locations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Location Multi-Select */}
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Select Locations</label>
                <div className="border rounded-lg p-3 space-y-2">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading locations...</div>
                  ) : locations.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No locations found</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLocations(locations.map(l => l.id))}
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLocations([])}
                        >
                          Clear All
                        </Button>
                        <Badge variant="secondary">
                          {selectedLocations.length} selected
                        </Badge>
                      </div>
                      <ScrollArea className="h-32 w-full">
                        <div className="space-y-1">
                          {locations.map((location) => (
                            <label
                              key={location.id}
                              className="flex items-center gap-2 p-1 hover:bg-secondary/50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLocations.includes(location.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLocations([...selectedLocations, location.id])
                                  } else {
                                    setSelectedLocations(selectedLocations.filter(id => id !== location.id))
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm">{location.location_name}</span>
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Title (optional)</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
              </div>

              {/* Content */}
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Content *</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="What would you like to share?" />
                <div className="flex gap-2">
                  <Button type="button" onClick={handleGenerate} variant="outline" className="gap-2" disabled={genLoading}>
                    {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate with AI
                  </Button>
                </div>
              </div>

              {/* Image Upload */}
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Image</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" asChild>
                        <div>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </div>
                      </Button>
                    </label>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview("")
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-primary/20">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Call to Action</label>
                  <Select onValueChange={setCta} value={cta}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOOK">Book</SelectItem>
                      <SelectItem value="ORDER">Order Online</SelectItem>
                      <SelectItem value="SHOP">Shop</SelectItem>
                      <SelectItem value="LEARN_MORE">Learn More</SelectItem>
                      <SelectItem value="SIGN_UP">Sign Up</SelectItem>
                      <SelectItem value="CALL">Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {cta && (
                  <div className="grid gap-2">
                    <label className="text-sm text-muted-foreground">CTA URL</label>
                    <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://example.com" />
                  </div>
                )}
              </div>

              {/* Schedule */}
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground">Schedule (optional)</label>
                <Input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={selectedLocations.length === 0 || !content.trim() || saving} variant="outline" className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Save Draft
                </Button>
                <Button onClick={handlePublish} disabled={selectedLocations.length === 0 || !content.trim() || saving} className="gap-2 gradient-orange">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(title || content || imagePreview) && (
            <Card className="border border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="w-full h-48 rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {title && <h3 className="font-semibold text-lg">{title}</h3>}
                  {content && <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>}
                  {cta && (
                    <Button variant="outline" size="sm" className="mt-2">
                      {cta.replace('_', ' ')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="border border-primary/20 glass-strong">
            <CardHeader>
              <CardTitle>Post Templates</CardTitle>
              <CardDescription>Use pre-made templates to quickly create posts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.label}</h4>
                      <p className="text-sm text-muted-foreground">{template.content}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContent(template.content)}
                    >
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border border-primary/20 glass-strong">
            <CardHeader>
              <CardTitle>Post History</CardTitle>
              <CardDescription>View and manage your previous posts</CardDescription>
            </CardHeader>
            <CardContent>
              {listLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {post.title && <h4 className="font-semibold mb-1">{post.title}</h4>}
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function GMBDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      })
      fetchNotifications()
    } catch (e) {
      console.error('Failed to mark as read:', e)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      fetchNotifications()
    } catch (e) {
      console.error('Failed to mark all as read:', e)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' })
      fetchNotifications()
    } catch (e) {
      console.error('Failed to delete notification:', e)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review': return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-primary" />
    }
  }

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push("/auth/login")
          return
        }

        setUser(authUser)

        const { data: locations, error: locationsError } = await supabase
          .from("gmb_locations")
          .select("*")
          .eq("user_id", authUser.id)

        const { data: reviews, error: reviewsError } = await supabase
          .from("gmb_reviews")
          .select("*")
          .eq("user_id", authUser.id)

        if (locationsError || reviewsError) {
          throw new Error(locationsError?.message || reviewsError?.message || "Failed to fetch data")
        }

        const totalLocations = locations?.length || 0
        const totalReviews = reviews?.length || 0
        const averageRating =
          reviews && reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : "0.0"

        const respondedReviews = reviews?.filter((r) => r.status === "responded").length || 0
        const responseRate = totalReviews > 0 ? Math.round((respondedReviews / totalReviews) * 100) : 0

        setStats({
          totalLocations,
          totalReviews,
          averageRating,
          responseRate,
        })
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const renderDashboardContent = () => {
    if (error) {
      return (
        <Card className="bg-card border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Failed to load dashboard data</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <LoadingSkeleton type="stat" count={4} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Locations"
              value={stats?.totalLocations || 0}
              change="+2 this month"
              changeType="positive"
              icon={MapPin}
              index={0}
            />
            <StatCard
              title="Total Reviews"
              value={stats?.totalReviews || 0}
              change="+12 this week"
              changeType="positive"
              icon={MessageSquare}
              index={1}
            />
            <StatCard
              title="Average Rating"
              value={stats?.averageRating || "0.0"}
              change="+0.2 from last month"
              changeType="positive"
              icon={Star}
              index={2}
            />
            <StatCard
              title="Response Rate"
              value={`${stats?.responseRate || 0}%`}
              change="+5% this month"
              changeType="positive"
              icon={TrendingUp}
              index={3}
            />
          </div>
        )}

        {/* Empty State - No GMB Account Connected */}
        {!loading && stats?.totalLocations === 0 && (
          <Card className="bg-card border-primary/30">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">No Google My Business Account Connected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Connect your Google My Business account to start managing your locations, reviews, and content.
                  </p>
                </div>
                <Button size="lg" className="mt-4" asChild>
                  <Link href="/accounts">
                    <Users className="mr-2 h-5 w-5" />
                    Connect Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart />
          <ActivityFeed />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <GMBDashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] transition-all duration-300">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 border-b border-primary/30 bg-card/90 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground lg:hidden">GMB Dashboard</h2>
              </div>

              {/* Notifications */}
              <div className="flex items-center gap-3">
                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 md:w-96 p-0" align="end">
                    <div className="border-b border-primary/20 p-4 flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs">
                          <CheckCheck className="w-3 h-3 mr-1" />
                          Mark all read
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="h-[400px]">
                      {notificationsLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-primary/10">
                          {notifications.map((notif: any) => (
                            <div
                              key={notif.id}
                              className={cn(
                                "p-4 hover:bg-primary/5 transition-colors",
                                !notif.read && "bg-primary/5"
                              )}
                            >
                              <div className="flex gap-3">
                                <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{notif.title}</p>
                                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                                      <p className="text-xs text-muted-foreground/70 mt-1">
                                        {new Date(notif.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      {!notif.read && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => markNotificationAsRead(notif.id)}
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => deleteNotification(notif.id)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  {notif.link && (
                                    <Link href={notif.link} className="text-xs text-primary hover:underline mt-1 inline-block">
                                      View details →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
        {/* Render content based on active tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Here's your GMB overview.</p>
            </div>
            {/* Dashboard Content */}
            {renderDashboardContent()}
          </div>
        )}

        {activeTab === "locations" && <LocationsList />}
        
        {activeTab === "reviews" && <ReviewsList />}
        
        {activeTab === "posts" && <GMBPostsSection />}
        
        {activeTab === "analytics" && <AnalyticsDashboard />}
        
        {activeTab === "settings" && <GMBSettings />}
      </main>
    </div>
    </div>
  )
}