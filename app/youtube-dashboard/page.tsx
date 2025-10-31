"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/dashboard/stat-card"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { YoutubeDashboardSidebar } from "@/components/dashboard/youtube-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Youtube,
  Users,
  Eye,
  Video,
  RefreshCw,
  Download,
  ThumbsUp,
  Calendar,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Settings as SettingsIcon,
  Search,
  Trash2,
  Save,
  LayoutGrid,
  Play,
  FileVideo,
  MessageCircle,
  Wand2,
  Bell,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  LogOut,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type YTStatistics = { subscriberCount?: string; viewCount?: string; videoCount?: string }
type YTMetadata = { email?: string | null; channel_title?: string | null; statistics?: YTStatistics | null }
type YTVideo = { id: string; title: string; thumbnail: string; views: number; publishedAt: string; url: string }
type YTComment = { id: string; author: string; text: string; likes: number; publishedAt: string; videoUrl: string }
type YTAnalytics = { lastUpdated: string; months: string[]; viewsPerMonth: number[]; videosPerMonth: number[]; totalViews: number; totalVideos: number }
type Draft = { id: string; title: string; description: string; hashtags: string; created_at: string }

export default function YoutubeDashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [channelTitle, setChannelTitle] = useState<string | null>(null)
  const [channelEmail, setChannelEmail] = useState<string | null>(null)
  const [stats, setStats] = useState({ subs: 0, views: 0, videos: 0 })
  const [videos, setVideos] = useState<YTVideo[]>([])
  const [comments, setComments] = useState<YTComment[]>([])
  const [analytics, setAnalytics] = useState<YTAnalytics | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])

  // Composer state
  const [prompt, setPrompt] = useState("")
  const [tone, setTone] = useState<"neutral"|"friendly"|"professional"|"energetic">("neutral")
  const [genLoading, setGenLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [schedule, setSchedule] = useState("")
  const [saving, setSaving] = useState(false)

  // Filters
  const [vSearch, setVSearch] = useState("")
  const [vFrom, setVFrom] = useState("")
  const [vTo, setVTo] = useState("")
  const [cSearch, setCSearch] = useState("")
  const [cFrom, setCFrom] = useState("")
  const [cTo, setCTo] = useState("")

  // Pagination
  const [commentsPage, setCommentsPage] = useState(1)
  const commentsPerPage = 6

  // Safe fetch helpers
  const safeGet = async (url: string) => {
    const r = await fetch(url, { headers: { Accept: "application/json" } })
    const t = await r.text()
    let j: any = {}
    try { j = JSON.parse(t) } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `GET ${url} failed`)
    return j
  }
  const safePost = async (url: string, body?: any) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    const t = await r.text()
    let j: any = {}
    try { j = JSON.parse(t) } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `POST ${url} failed`)
    return j
  }
  const safeDelete = async (url: string) => {
    const r = await fetch(url, { method: "DELETE", headers: { Accept: "application/json" } })
    const t = await r.text()
    let j: any = {}
    try { j = JSON.parse(t) } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `DELETE ${url} failed`)
    return j
  }

  // Data loaders
  const fetchFromDB = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Please login first")
    const { data, error: qErr } = await supabase
      .from("oauth_tokens")
      .select("provider, account_id, metadata")
      .eq("user_id", user.id)
      .eq("provider", "youtube")
      .maybeSingle()
    if (qErr) throw qErr
    if (!data) {
      setChannelTitle(null)
      setChannelEmail(null)
      setStats({ subs: 0, views: 0, videos: 0 })
      setVideos([])
      setComments([])
      setAnalytics(null)
      return false
    }
    const meta = (data.metadata || {}) as YTMetadata
    const s = meta.statistics || {}
    setChannelTitle(meta.channel_title || "YouTube Channel")
    setChannelEmail(meta.email || null)
    setStats({
      subs: Number(s.subscriberCount || 0),
      views: Number(s.viewCount || 0),
      videos: Number(s.videoCount || 0),
    })
    return true
  }
  const fetchVideos = async () => {
    const j = await safeGet("/api/youtube/videos")
    setVideos(j.items || [])
  }
  const fetchComments = async () => {
    const j = await safeGet("/api/youtube/comments")
    setComments(j.items || [])
  }
  const fetchAnalytics = async () => {
    const j = await safeGet("/api/youtube/analytics")
    setAnalytics(j as YTAnalytics)
  }
  const fetchDrafts = async () => {
    const j = await safeGet("/api/youtube/composer/drafts")
    setDrafts(j.items || [])
  }

  // Actions
  const handleConnectYoutube = async () => {
    try {
      setConnecting(true)
      const data = await safePost("/api/youtube/create-auth-url", {})
      if (data.authUrl) window.location.href = data.authUrl
    } catch (e: any) {
      toast.error(e.message || "Failed to start YouTube connection")
      setConnecting(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await safePost("/api/youtube/token/refresh-if-needed")
      await safePost("/api/youtube/refresh")
      await Promise.all([fetchFromDB(), fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()])
      toast.success("Data refreshed successfully!")
    } catch (e: any) {
      toast.error(e.message || "Failed to update data")
    } finally {
      setRefreshing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect YouTube?")) return
    try {
      setDisconnecting(true)
      await safePost("/api/youtube/disconnect")
      setChannelTitle(null)
      setChannelEmail(null)
      setStats({ subs: 0, views: 0, videos: 0 })
      setVideos([])
      setComments([])
      setAnalytics(null)
      setDrafts([])
      toast.success("YouTube disconnected successfully")
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect YouTube")
    } finally {
      setDisconnecting(false)
    }
  }

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

  const handleGenerate = async () => {
    try {
      setGenLoading(true)
      const res = await safePost("/api/youtube/composer/generate", { prompt, tone })
      setTitle(res.title || "")
      setDescription(res.description || "")
      setHashtags(res.hashtags || "")
      toast.success("Content generated successfully!")
    } catch (e: any) {
      toast.error(e.message || "Failed to generate content")
    } finally {
      setGenLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      const res = await safePost("/api/youtube/composer/drafts", { title, description, hashtags })
      if (res?.item) {
        setDrafts(d => [res.item, ...d])
        setTitle("")
        setDescription("")
        setHashtags("")
        toast.success("Draft saved successfully!")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save draft")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDraft = async (id: string) => {
    try {
      await safeDelete(`/api/youtube/composer/drafts?id=${encodeURIComponent(id)}`)
      setDrafts(d => d.filter(x => x.id !== id))
      toast.success("Draft deleted")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete draft")
    }
  }

  // Init
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push("/auth/login")
          return
        }
        
        setUser(authUser)
        await safePost("/api/youtube/token/refresh-if-needed")
        const has = await fetchFromDB()
        if (has) {
          await Promise.all([fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()])
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to load channel data")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Filters
  const filteredVideos = useMemo(() => videos.filter(v => {
    const q = vSearch.trim().toLowerCase()
    const okQ = !q || v.title.toLowerCase().includes(q)
    const d = new Date(v.publishedAt).getTime()
    const okFrom = !vFrom || d >= new Date(vFrom).getTime()
    const okTo = !vTo || d <= new Date(vTo).getTime()
    return okQ && okFrom && okTo
  }), [videos, vSearch, vFrom, vTo])

  const filteredComments = useMemo(() => comments.filter(c => {
    const q = cSearch.trim().toLowerCase()
    const okQ = !q || c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q)
    const d = new Date(c.publishedAt).getTime()
    const okFrom = !cFrom || d >= new Date(cFrom).getTime()
    const okTo = !cTo || d <= new Date(cTo).getTime()
    return okQ && okFrom && okTo
  }), [comments, cSearch, cFrom, cTo])

  // Paginated comments
  const paginatedComments = useMemo(() => {
    const start = (commentsPage - 1) * commentsPerPage
    const end = start + commentsPerPage
    return filteredComments.slice(start, end)
  }, [filteredComments, commentsPage])

  const totalPages = Math.ceil(filteredComments.length / commentsPerPage)

  // CSV export
  const exportCSV = (rows: any[], headers: string[], filename: string) => {
    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`
    const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(","))).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportVideosCSV = () => {
    exportCSV(
      filteredVideos.map(v => ({ id: v.id, title: v.title, views: v.views, publishedAt: v.publishedAt, url: v.url })),
      ["id", "title", "views", "publishedAt", "url"],
      "youtube_videos.csv"
    )
    toast.success("Videos exported to CSV")
  }

  const exportCommentsCSV = () => {
    exportCSV(
      filteredComments.map(c => ({ id: c.id, author: c.author, likes: c.likes, publishedAt: c.publishedAt, text: c.text.replace(/\n/g, " "), videoUrl: c.videoUrl })),
      ["id", "author", "likes", "publishedAt", "text", "videoUrl"],
      "youtube_comments.csv"
    )
    toast.success("Comments exported to CSV")
  }

  // Chart data
  const viewsChartData = useMemo(() => {
    if (!analytics) return null
    const labels = analytics.months.map((m: string) => m.slice(0, 7))
    return {
      labels,
      datasets: [{
        label: "Views",
        data: analytics.viewsPerMonth,
        borderColor: "#FF6B00",
        backgroundColor: "rgba(255,107,0,0.15)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: "#FF6B00",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    }
  }, [analytics])

  const videosChartData = useMemo(() => {
    if (!analytics) return null
    const labels = analytics.months.map((m: string) => m.slice(0, 7))
    return {
      labels,
      datasets: [{
        label: "Videos",
        data: analytics.videosPerMonth,
        backgroundColor: "rgba(255,107,0,0.35)",
        borderColor: "#FF6B00",
        borderWidth: 1,
        borderRadius: 6,
      }]
    }
  }, [analytics])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: "#888",
          font: { size: 12 }
        } 
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#FF6B00",
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255,107,0,0.05)" },
        ticks: { color: "#888" }
      },
      y: {
        grid: { color: "rgba(255,107,0,0.05)" },
        ticks: { color: "#888" }
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <YoutubeDashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] transition-all duration-300">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 border-b border-primary/30 bg-card/90 backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground lg:hidden">YouTube Dashboard</h2>
              </div>

            {/* Right side - User Menu */}
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
      <main className="p-4 sm:p-6 space-y-6">

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <LoadingSkeleton type="stat" count={3} />
            <LoadingSkeleton type="card" count={2} />
          </div>
        ) : !channelTitle ? (
          // Not Connected State
          <Card className="bg-card border-primary/30 glass">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">No YouTube Channel Connected</h3>
                  <p className="text-muted-foreground max-w-md">
                    Connect your YouTube channel to start managing videos, comments, and analytics all in one place.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="mt-4 bg-red-600 hover:bg-red-700" 
                  onClick={handleConnectYoutube}
                  disabled={connecting}
                >
                  {connecting ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Youtube className="mr-2 h-5 w-5" />
                      Connect YouTube Channel
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Connected State - Tab Content
          <div className="space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                  <StatCard
                    title="Subscribers"
                    value={stats.subs.toLocaleString()}
                    change="+2.5% from last month"
                    changeType="positive"
                    icon={Users}
                    index={0}
                  />
                  <StatCard
                    title="Total Views"
                    value={stats.views.toLocaleString()}
                    change="+15% from last month"
                    changeType="positive"
                    icon={Eye}
                    index={1}
                  />
                  <StatCard
                    title="Videos"
                    value={stats.videos.toLocaleString()}
                    change="+3 this month"
                    changeType="positive"
                    icon={Video}
                    index={2}
                  />
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Views Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewsChartData ? (
                        <div className="h-[300px]">
                          <Line data={viewsChartData} options={chartOptions} />
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Videos Published</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {videosChartData ? (
                        <div className="h-[300px]">
                          <Bar data={videosChartData} options={chartOptions} />
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          No data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Channel Info */}
                <Card className="bg-card border-primary/30 glass">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{channelTitle}</CardTitle>
                      <CardDescription>{channelEmail}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                </Card>
              </>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* Analytics Header */}
                <div>
                  <h2 className="text-2xl font-bold">Channel Analytics</h2>
                  <p className="text-muted-foreground">Comprehensive insights into your YouTube channel performance</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-card border-primary/30 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Subscribers</p>
                          <p className="text-2xl font-bold">{stats.subs.toLocaleString()}</p>
                          <p className="text-xs text-green-500">+12.5% from last month</p>
                        </div>
                        <Users className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card border-primary/30 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
                          <p className="text-xs text-green-500">+8.3% from last month</p>
                        </div>
                        <Eye className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card border-primary/30 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Watch Time (hours)</p>
                          <p className="text-2xl font-bold">{Math.floor(stats.views * 0.15).toLocaleString()}</p>
                          <p className="text-xs text-green-500">+15.2% from last month</p>
                        </div>
                        <Play className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card border-primary/30 glass">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Revenue</p>
                          <p className="text-2xl font-bold">${(stats.views * 0.003).toFixed(2)}</p>
                          <p className="text-xs text-green-500">+5.7% from last month</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Chart */}
                <Card className="bg-card border-primary/30 glass">
                  <CardHeader>
                    <CardTitle>Channel Performance</CardTitle>
                    <CardDescription>Views and engagement over the last 12 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {viewsChartData ? (
                      <div className="h-[400px]">
                        <Line data={viewsChartData} options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: { display: false }
                          }
                        }} />
                      </div>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Engagement & Demographics */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Engagement Metrics */}
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                      <CardDescription>Audience interaction statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ThumbsUp className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Average Likes per Video</span>
                        </div>
                        <span className="font-semibold">{Math.floor(stats.views / stats.videos / 10).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">Average Comments</span>
                        </div>
                        <span className="font-semibold">{Math.floor(stats.views / stats.videos / 50).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-purple-500" />
                          <span className="text-sm">Click-through Rate</span>
                        </div>
                        <span className="font-semibold">4.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Play className="h-5 w-5 text-orange-500" />
                          <span className="text-sm">Average View Duration</span>
                        </div>
                        <span className="font-semibold">6:45</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Traffic Sources */}
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Traffic Sources</CardTitle>
                      <CardDescription>Where your views come from</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { source: 'YouTube Search', percentage: 35, color: 'bg-blue-500' },
                        { source: 'Suggested Videos', percentage: 28, color: 'bg-green-500' },
                        { source: 'Browse Features', percentage: 20, color: 'bg-purple-500' },
                        { source: 'External', percentage: 12, color: 'bg-orange-500' },
                        { source: 'Other', percentage: 5, color: 'bg-gray-500' }
                      ].map((item) => (
                        <div key={item.source} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.source}</span>
                            <span className="font-semibold">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Videos Table */}
                <Card className="bg-card border-primary/30 glass">
                  <CardHeader>
                    <CardTitle>Top Performing Videos</CardTitle>
                    <CardDescription>Your best content from the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-primary/20">
                          <tr className="text-left">
                            <th className="pb-3 text-sm font-medium text-muted-foreground">Video</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Views</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Watch Time</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Likes</th>
                            <th className="pb-3 text-sm font-medium text-muted-foreground text-right">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {videos.slice(0, 5).map((video, idx) => (
                            <tr key={video.id} className="hover:bg-secondary/30 transition-colors">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-20 h-12 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium line-clamp-1">{video.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(video.publishedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-right text-sm">{video.views.toLocaleString()}</td>
                              <td className="py-3 text-right text-sm">{Math.floor(video.views * 0.1).toLocaleString()}h</td>
                              <td className="py-3 text-right text-sm">{Math.floor(video.views / 20).toLocaleString()}</td>
                              <td className="py-3 text-right text-sm">{(3.5 + idx * 0.5).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "posts" && (
              <Card className="bg-card border-primary/30 glass">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">YouTube Posts</h3>
                      <p className="text-muted-foreground max-w-md">
                        Create and manage your YouTube video posts with AI-powered content generation.
                      </p>
                    </div>
                    <Button asChild size="lg" className="mt-4 gradient-orange">
                      <Link href="/youtube-posts">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Go to Posts Page
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "videos" && (
              <Card className="bg-card border-primary/30 glass">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>Videos</CardTitle>
                    <Button variant="outline" size="sm" onClick={exportVideosCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Search videos..."
                      value={vSearch}
                      onChange={(e) => setVSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={vFrom}
                      onChange={(e) => setVFrom(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <Input
                      type="date"
                      value={vTo}
                      onChange={(e) => setVTo(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                  </div>

                  {/* Videos List */}
                  <div className="grid gap-4">
                    {filteredVideos.map((video) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-secondary/50 border border-primary/20"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full sm:w-32 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground line-clamp-1">{video.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {video.views.toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(video.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      </motion.div>
                    ))}
                    {filteredVideos.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No videos found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "comments" && (
              <Card className="bg-card border-primary/30 glass">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle>Comments</CardTitle>
                    <Button variant="outline" size="sm" onClick={exportCommentsCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Search comments..."
                      value={cSearch}
                      onChange={(e) => setCSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={cFrom}
                      onChange={(e) => setCFrom(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                    <Input
                      type="date"
                      value={cTo}
                      onChange={(e) => setCTo(e.target.value)}
                      className="w-full sm:w-auto"
                    />
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {paginatedComments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg bg-secondary/50 border border-primary/20"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-foreground">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.publishedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {comment.likes}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={comment.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs">
                                  View Video →
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {filteredComments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No comments found
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommentsPage(Math.max(1, commentsPage - 1))}
                        disabled={commentsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm text-muted-foreground">
                        Page {commentsPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCommentsPage(Math.min(totalPages, commentsPage + 1))}
                        disabled={commentsPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "composer" && (
              <Tabs defaultValue="compose" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        YouTube Post Composer
                      </CardTitle>
                      <CardDescription>
                        Generate titles, descriptions and hashtags with AI, then save as draft or schedule
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                          placeholder="Video title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          value={description} 
                          onChange={(e) => setDescription(e.target.value)} 
                          rows={8} 
                          placeholder="Video description"
                        />
                        <div className="flex gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button type="button" variant="outline" className="gap-2">
                                <Wand2 className="w-4 h-4" /> AI Options
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">AI Prompt</label>
                                  <Textarea
                                    placeholder="Describe what you want to create..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Tone</label>
                                  <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="neutral">Neutral</SelectItem>
                                      <SelectItem value="friendly">Friendly</SelectItem>
                                      <SelectItem value="professional">Professional</SelectItem>
                                      <SelectItem value="energetic">Energetic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  onClick={handleGenerate}
                                  disabled={genLoading || (!prompt && !title && !description)}
                                  className="w-full"
                                >
                                  {genLoading ? (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Generate with AI
                                    </>
                                  )}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hashtags</label>
                        <Input 
                          value={hashtags} 
                          onChange={(e) => setHashtags(e.target.value)} 
                          placeholder="#NNH #AI #YouTube"
                        />
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="grid gap-2">
                          <label className="text-sm text-muted-foreground">Schedule (optional)</label>
                          <Input 
                            type="datetime-local" 
                            value={schedule} 
                            onChange={(e) => setSchedule(e.target.value)} 
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={handleSaveDraft} 
                          disabled={!title.trim() || !description.trim() || saving} 
                          className="gap-2"
                        >
                          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                          Save Draft
                        </Button>
                        <Button 
                          variant="outline" 
                          type="button" 
                          className="gap-2" 
                          disabled 
                          title="YouTube video upload coming soon - drafts can be saved"
                        >
                          <FileVideo className="w-4 h-4" /> Upload to YouTube
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preview Card */}
                  {(title || description || hashtags) && (
                    <Card className="bg-card border-primary/30 glass">
                      <CardHeader>
                        <CardTitle className="text-base">Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {title && <h3 className="font-semibold text-lg">{title}</h3>}
                        {description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {description}
                          </p>
                        )}
                        {hashtags && (
                          <div className="flex flex-wrap gap-2">
                            {hashtags.split(' ').filter(tag => tag.startsWith('#')).map((tag, idx) => (
                              <Badge key={idx} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Content Templates</CardTitle>
                      <CardDescription>Quick templates for different types of YouTube content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          id: 'tutorial',
                          label: 'Tutorial',
                          title: 'How to [Topic] - Complete Guide',
                          description: 'In this video, I\'ll show you step-by-step how to [topic].\n\nTimestamps:\n00:00 Introduction\n00:30 What you\'ll need\n01:00 Step 1\n02:00 Step 2\n03:00 Final results\n\nDon\'t forget to like and subscribe!',
                          hashtags: '#tutorial #howto #guide'
                        },
                        {
                          id: 'vlog',
                          label: 'Vlog',
                          title: 'A Day in My Life - [Date/Event]',
                          description: 'Come along with me as I [activity]!\n\nToday was amazing because [reason].\n\nConnect with me:\n• Instagram: @username\n• Twitter: @username\n\nMusic credits: [artist/source]',
                          hashtags: '#vlog #dayinmylife #lifestyle'
                        },
                        {
                          id: 'review',
                          label: 'Product Review',
                          title: '[Product Name] Review - Is It Worth It?',
                          description: 'My honest review of [product] after [time period] of use.\n\nPros:\n• [Pro 1]\n• [Pro 2]\n\nCons:\n• [Con 1]\n• [Con 2]\n\nFinal verdict: [rating/recommendation]\n\nDisclaimer: This video is not sponsored.',
                          hashtags: '#review #tech #honest'
                        },
                        {
                          id: 'announcement',
                          label: 'Announcement',
                          title: 'Big News! [Announcement Topic]',
                          description: 'I\'m excited to share that [announcement]!\n\nWhat this means:\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nThank you all for your support!\n\nStay tuned for more updates.',
                          hashtags: '#announcement #news #update'
                        }
                      ].map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{template.label}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{template.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-3">{template.description}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTitle(template.title)
                                setDescription(template.description)
                                setHashtags(template.hashtags)
                              }}
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="drafts" className="space-y-4">
                  <Card className="bg-card border-primary/30 glass">
                    <CardHeader>
                      <CardTitle>Saved Drafts</CardTitle>
                      <CardDescription>Your saved video drafts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {drafts.map((draft) => (
                        <motion.div
                          key={draft.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-lg bg-secondary/50 border border-primary/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{draft.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{draft.description}</p>
                              <p className="text-xs text-primary mt-2">{draft.hashtags}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created {new Date(draft.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setTitle(draft.title)
                                  setDescription(draft.description)
                                  setHashtags(draft.hashtags)
                                }}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDraft(draft.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {drafts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No saved drafts
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {activeTab === "settings" && (
              <Card className="bg-card border-primary/30 glass">
                <CardHeader>
                  <CardTitle>YouTube Settings</CardTitle>
                  <CardDescription>
                    Manage your YouTube channel connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Channel Information</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Channel:</span> {channelTitle}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Email:</span> {channelEmail}
                      </p>
                      {analytics && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Last Updated:</span> {new Date(analytics.lastUpdated).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Data
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                    >
                      {disconnecting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Disconnect YouTube
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  )
}