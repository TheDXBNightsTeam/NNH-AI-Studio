"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/dashboard/stat-card"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Youtube,
  Users,
  Eye,
  Video,
  RefreshCw,
  LogOut,
  Download,
  ThumbsUp,
  Calendar,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Settings as SettingsIcon,
  Search,
  Trash2,
  Save
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

  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

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
        backgroundColor: "rgba(17, 17, 17, 0.95)",
        titleColor: "#FF6B00",
        bodyColor: "#fff",
        borderColor: "#FF6B00",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        ticks: { color: "#888", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: { 
        ticks: { color: "#888", font: { size: 11 } }, 
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">YouTube Studio</h1>
          <p className="text-muted-foreground mt-1">Manage your YouTube channel and content</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <LoadingSkeleton type="stat" count={3} />
        </div>
        <LoadingSkeleton type="card" count={2} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">YouTube Studio</h1>
          <p className="text-muted-foreground mt-1">
            {channelTitle ? (
              <span className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-primary" />
                Connected: {channelTitle}
              </span>
            ) : (
              "Connect your YouTube channel to get started"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {channelTitle && (
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-primary/30 hover:border-primary/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {!channelTitle ? (
            <Button
              onClick={handleConnectYoutube}
              disabled={connecting}
              className="bg-primary hover:bg-primary/90"
            >
              <Youtube className="w-4 h-4 mr-2" />
              {connecting ? "Connecting..." : "Connect YouTube"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Stats Grid */}
      {channelTitle ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Subscribers"
            value={stats.subs}
            change="+12% this month"
            changeType="positive"
            icon={Users}
            index={0}
          />
          <StatCard
            title="Total Views"
            value={stats.views}
            change="+25% this month"
            changeType="positive"
            icon={Eye}
            index={1}
          />
          <StatCard
            title="Total Videos"
            value={stats.videos}
            change="+3 this week"
            changeType="positive"
            icon={Video}
            index={2}
          />
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-card border-primary/30">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Youtube className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No YouTube Channel Connected</h3>
                <p className="text-muted-foreground max-w-md">
                  Connect your YouTube channel to start managing your videos, comments, and analytics.
                </p>
              </div>
              <Button size="lg" className="mt-4" onClick={handleConnectYoutube} disabled={connecting}>
                <Youtube className="mr-2 h-5 w-5" />
                {connecting ? "Connecting..." : "Connect YouTube Channel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      {channelTitle && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="composer">Composer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Views Chart */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Views Trend
                  </CardTitle>
                  <CardDescription>Monthly view statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {viewsChartData ? (
                    <div className="h-[300px]">
                      <Line data={viewsChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No analytics data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Videos Chart */}
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Video Uploads
                  </CardTitle>
                  <CardDescription>Monthly upload statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {videosChartData ? (
                    <div className="h-[300px]">
                      <Bar data={videosChartData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No analytics data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Videos */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle>Recent Videos</CardTitle>
                <CardDescription>Your latest uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videos.slice(0, 3).map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold line-clamp-1">{video.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {video.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="hover:bg-primary/20"
                      >
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Videos</CardTitle>
                    <CardDescription>Manage and filter your video content</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search videos..."
                        value={vSearch}
                        onChange={(e) => setVSearch(e.target.value)}
                        className="w-[200px]"
                      />
                    </div>
                    <Input
                      type="date"
                      value={vFrom}
                      onChange={(e) => setVFrom(e.target.value)}
                      className="w-[140px]"
                    />
                    <Input
                      type="date"
                      value={vTo}
                      onChange={(e) => setVTo(e.target.value)}
                      className="w-[140px]"
                    />
                    <Button variant="outline" onClick={exportVideosCSV}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVideos.map((video, idx) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/30">
                        <div className="aspect-video relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button size="sm" variant="secondary" asChild>
                              <a href={video.url} target="_blank" rel="noopener noreferrer">
                                Watch on YouTube
                              </a>
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold line-clamp-2 mb-2">{video.title}</h4>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {video.views.toLocaleString()}
                            </span>
                            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {filteredVideos.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No videos found matching your filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card className="glass border-primary/20">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>Recent comments on your videos</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search comments..."
                        value={cSearch}
                        onChange={(e) => setCSearch(e.target.value)}
                        className="w-[200px]"
                      />
                    </div>
                    <Input
                      type="date"
                      value={cFrom}
                      onChange={(e) => setCFrom(e.target.value)}
                      className="w-[140px]"
                    />
                    <Input
                      type="date"
                      value={cTo}
                      onChange={(e) => setCTo(e.target.value)}
                      className="w-[140px]"
                    />
                    <Button variant="outline" onClick={exportCommentsCSV}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {paginatedComments.map((comment, idx) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow border-primary/10 hover:border-primary/30">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{comment.author}</h4>
                              <Badge variant="secondary">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {comment.likes}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(comment.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm line-clamp-3 mb-3">{comment.text}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="w-full"
                        >
                          <a href={comment.videoUrl} target="_blank" rel="noopener noreferrer">
                            View on YouTube
                          </a>
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommentsPage(p => Math.max(1, p - 1))}
                      disabled={commentsPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4">
                      Page {commentsPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCommentsPage(p => Math.min(totalPages, p + 1))}
                      disabled={commentsPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                {filteredComments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No comments found matching your filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Composer Tab */}
          <TabsContent value="composer" className="space-y-6">
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Content Composer
                </CardTitle>
                <CardDescription>Generate YouTube content with AI assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content Topic</label>
                    <Textarea
                      placeholder="Describe what your video is about..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
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
                    disabled={genLoading || !prompt.trim()}
                    className="w-full"
                  >
                    {genLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </div>

                {(title || description || hashtags) && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Video title..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Video description..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hashtags</label>
                      <Input
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        placeholder="#youtube #content..."
                      />
                    </div>
                    <Button
                      onClick={handleSaveDraft}
                      disabled={saving || !title.trim()}
                      className="w-full"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Drafts */}
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle>Saved Drafts</CardTitle>
                <CardDescription>Your saved content drafts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drafts.map((draft, idx) => (
                    <motion.div
                      key={draft.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-lg bg-secondary/30 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{draft.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {draft.description}
                          </p>
                          <p className="text-xs text-primary mt-2">{draft.hashtags}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(draft.created_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                  {drafts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No drafts saved yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="glass border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  Channel Settings
                </CardTitle>
                <CardDescription>Manage your YouTube connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/30">
                    <h4 className="font-semibold mb-2">Connected Channel</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Channel:</span>{" "}
                        <span className="font-medium">{channelTitle}</span>
                      </p>
                      {channelEmail && (
                        <p>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <span className="font-medium">{channelEmail}</span>
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge variant="secondary" className="ml-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Connected
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Disconnecting will remove access to your YouTube channel data. You can reconnect at any time.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="w-full sm:w-auto"
                    >
                      {disconnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Disconnect YouTube
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}