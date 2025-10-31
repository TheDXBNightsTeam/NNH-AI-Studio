"use client"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { LocationsList } from "@/components/locations/locations-list"
import { ReviewsList } from "@/components/reviews/reviews-list"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { GMBSettings } from "@/components/settings/gmb-settings"
import { GMBDashboardSidebar } from "@/components/dashboard/gmb-sidebar"
import { MapPin, MessageSquare, Star, TrendingUp, AlertCircle, Users, Bell, Check, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      <div className="flex-1 lg:ml-60 transition-all duration-300">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 border-b border-primary/20 bg-card/80 backdrop-blur-md">
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
        <main className="px-4 sm:px-6 lg:px-8 py-6">
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
        
        {activeTab === "posts" && (
          <Card className="bg-card border-primary/30 glass">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">GMB Posts</h3>
                  <p className="text-muted-foreground max-w-md">
                    Create and publish posts to your Google Business Profile locations with AI assistance.
                  </p>
                </div>
                <Button asChild size="lg" className="mt-4 gradient-orange">
                  <Link href="/gmb-posts">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Go to Posts Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === "analytics" && <AnalyticsDashboard />}
        
        {activeTab === "settings" && <GMBSettings />}
      </main>
    </div>
    </div>
  )
}