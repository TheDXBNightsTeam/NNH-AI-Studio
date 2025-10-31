"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { 
  Menu, 
  X, 
  Youtube, 
  BarChart3, 
  Sparkles, 
  MessageSquare, 
  Settings as SettingsIcon, 
  RefreshCw, 
  LogOut,
  Eye,
  Calendar,
  ThumbsUp,
  Download,
  TrendingUp,
  Video,
  Users
} from "lucide-react";
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

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
);

type YTStatistics = { subscriberCount?: string; viewCount?: string; videoCount?: string };
type YTMetadata = { email?: string | null; channel_title?: string | null; statistics?: YTStatistics | null };
type YTVideo = { id: string; title: string; thumbnail: string; views: number; publishedAt: string; url: string };
type YTComment = { id: string; author: string; text: string; likes: number; publishedAt: string; videoUrl: string };
type YTAnalytics = { lastUpdated: string; months: string[]; viewsPerMonth: number[]; videosPerMonth: number[]; totalViews: number; totalVideos: number };
type Draft = { id: string; title: string; description: string; hashtags: string; created_at: string };

export default function YoutubeDashboard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [channelTitle, setChannelTitle] = useState<string | null>(null);
  const [channelEmail, setChannelEmail] = useState<string | null>(null);
  const [stats, setStats] = useState({ subs: 0, views: 0, videos: 0 });
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [comments, setComments] = useState<YTComment[]>([]);
  const [analytics, setAnalytics] = useState<YTAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard"|"analytics"|"composer"|"comments"|"settings">("dashboard");

  // Composer state
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<"neutral"|"friendly"|"professional"|"energetic">("neutral");
  const [genLoading, setGenLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Filters
  const [vSearch, setVSearch] = useState("");
  const [vFrom, setVFrom] = useState("");
  const [vTo, setVTo] = useState("");
  const [cSearch, setCSearch] = useState("");
  const [cFrom, setCFrom] = useState("");
  const [cTo, setCTo] = useState("");

  // Pagination
  const [commentsPage, setCommentsPage] = useState(1);
  const commentsPerPage = 10;

  // Safe fetch helpers
  const safeGet = async (url: string) => {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const t = await r.text();
    let j: any = {};
    try { j = JSON.parse(t); } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `GET ${url} failed`);
    return j;
  };
  const safePost = async (url: string, body?: any) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    let j: any = {};
    try { j = JSON.parse(t); } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `POST ${url} failed`);
    return j;
  };
  const safeDelete = async (url: string) => {
    const r = await fetch(url, { method: "DELETE", headers: { Accept: "application/json" } });
    const t = await r.text();
    let j: any = {};
    try { j = JSON.parse(t); } catch {}
    if (!r.ok) throw new Error(j.error || t.slice(0, 300) || `DELETE ${url} failed`);
    return j;
  };

  // Data loaders
  const fetchFromDB = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login first");
    const { data, error: qErr } = await supabase
      .from("oauth_tokens")
      .select("provider, account_id, metadata")
      .eq("user_id", user.id)
      .eq("provider", "youtube")
      .maybeSingle();
    if (qErr) throw qErr;
    if (!data) {
      setChannelTitle(null);
      setChannelEmail(null);
      setStats({ subs: 0, views: 0, videos: 0 });
      setVideos([]);
      setComments([]);
      setAnalytics(null);
      return false;
    }
    const meta = (data.metadata || {}) as YTMetadata;
    const s = meta.statistics || {};
    setChannelTitle(meta.channel_title || "YouTube Channel");
    setChannelEmail(meta.email || null);
    setStats({
      subs: Number(s.subscriberCount || 0),
      views: Number(s.viewCount || 0),
      videos: Number(s.videoCount || 0),
    });
    return true;
  };
  const fetchVideos = async () => {
    const j = await safeGet("/api/youtube/videos");
    setVideos(j.items || []);
  };
  const fetchComments = async () => {
    const j = await safeGet("/api/youtube/comments");
    setComments(j.items || []);
  };
  const fetchAnalytics = async () => {
    const j = await safeGet("/api/youtube/analytics");
    setAnalytics(j as YTAnalytics);
  };
  const fetchDrafts = async () => {
    const j = await safeGet("/api/youtube/composer/drafts");
    setDrafts(j.items || []);
  };

  // Actions
  const handleConnectYoutube = async () => {
    try {
      setConnecting(true);
      const data = await safePost("/api/youtube/create-auth-url", {});
      if (data.authUrl) window.location.href = data.authUrl;
    } catch (e: any) {
      toast.error(e.message || "Failed to start YouTube connection");
      setConnecting(false);
    }
  };
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await safePost("/api/youtube/token/refresh-if-needed");
      await safePost("/api/youtube/refresh");
      await Promise.all([fetchFromDB(), fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()]);
      toast.success("Data refreshed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update data");
    } finally {
      setRefreshing(false);
    }
  };
  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect YouTube?")) return;
    try {
      setDisconnecting(true);
      await safePost("/api/youtube/disconnect");
      setChannelTitle(null);
      setChannelEmail(null);
      setStats({ subs: 0, views: 0, videos: 0 });
      setVideos([]);
      setComments([]);
      setAnalytics(null);
      setDrafts([]);
      toast.success("YouTube disconnected successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect YouTube");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenLoading(true);
      const res = await safePost("/api/youtube/composer/generate", { prompt, tone });
      setTitle(res.title || "");
      setDescription(res.description || "");
      setHashtags(res.hashtags || "");
      toast.success("Content generated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate content");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await safePost("/api/youtube/composer/drafts", { title, description, hashtags });
      if (res?.item) {
        setDrafts(d => [res.item, ...d]);
        toast.success("Draft saved successfully!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await safeDelete(`/api/youtube/composer/drafts?id=${encodeURIComponent(id)}`);
      setDrafts(d => d.filter(x => x.id !== id));
      toast.success("Draft deleted");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete draft");
    }
  };

  // Init
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await safePost("/api/youtube/token/refresh-if-needed");
        const has = await fetchFromDB();
        if (has) {
          await Promise.all([fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()]);
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to load channel data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filters
  const filteredVideos = useMemo(() => videos.filter(v => {
    const q = vSearch.trim().toLowerCase();
    const okQ = !q || v.title.toLowerCase().includes(q);
    const d = new Date(v.publishedAt).getTime();
    const okFrom = !vFrom || d >= new Date(vFrom).getTime();
    const okTo = !vTo || d <= new Date(vTo).getTime();
    return okQ && okFrom && okTo;
  }), [videos, vSearch, vFrom, vTo]);

  const filteredComments = useMemo(() => comments.filter(c => {
    const q = cSearch.trim().toLowerCase();
    const okQ = !q || c.text.toLowerCase().includes(q) || c.author.toLowerCase().includes(q);
    const d = new Date(c.publishedAt).getTime();
    const okFrom = !cFrom || d >= new Date(cFrom).getTime();
    const okTo = !cTo || d <= new Date(cTo).getTime();
    return okQ && okFrom && okTo;
  }), [comments, cSearch, cFrom, cTo]);

  // Paginated comments
  const paginatedComments = useMemo(() => {
    const start = (commentsPage - 1) * commentsPerPage;
    const end = start + commentsPerPage;
    return filteredComments.slice(start, end);
  }, [filteredComments, commentsPage]);

  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // CSV export
  const exportCSV = (rows: any[], headers: string[], filename: string) => {
    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(",")].concat(rows.map(r => headers.map(h => esc(r[h])).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportVideosCSV = () => {
    exportCSV(
      filteredVideos.map(v => ({ id: v.id, title: v.title, views: v.views, publishedAt: v.publishedAt, url: v.url })),
      ["id", "title", "views", "publishedAt", "url"],
      "youtube_videos.csv"
    );
    toast.success("Videos exported to CSV");
  };
  const exportCommentsCSV = () => {
    exportCSV(
      filteredComments.map(c => ({ id: c.id, author: c.author, likes: c.likes, publishedAt: c.publishedAt, text: c.text.replace(/\n/g, " "), videoUrl: c.videoUrl })),
      ["id", "author", "likes", "publishedAt", "text", "videoUrl"],
      "youtube_comments.csv"
    );
    toast.success("Comments exported to CSV");
  };

  // Chart data
  const viewsChartData = useMemo(() => {
    if (!analytics) return null;
    const labels = analytics.months.map((m: string) => m.slice(0, 7));
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
    };
  }, [analytics]);

  const videosChartData = useMemo(() => {
    if (!analytics) return null;
    const labels = analytics.months.map((m: string) => m.slice(0, 7));
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
    };
  }, [analytics]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: "#fff",
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
        ticks: { color: "#aaa", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.05)" }
      },
      y: { 
        ticks: { color: "#aaa", font: { size: 11 } }, 
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.05)" }
      }
    }
  };

  // Sidebar content
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="text-neon-orange font-extrabold text-xl mb-6 flex items-center gap-2">
        <Youtube className="w-6 h-6" />
        NNH • YouTube
      </div>
      <nav className="space-y-2 flex-1">
        {[
          { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
          { id: "analytics" as const, label: "Analytics", icon: TrendingUp },
          { id: "composer" as const, label: "Composer", icon: Sparkles },
          { id: "comments" as const, label: "Comments", icon: MessageSquare },
          { id: "settings" as const, label: "Settings", icon: SettingsIcon },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center gap-2 ${
              activeTab === t.id 
                ? "bg-neon-orange text-black font-bold shadow-lg" 
                : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
        <Button 
          className="w-full bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
          onClick={handleRefresh} 
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? "Updating..." : "Refresh"}
        </Button>
        <Button 
          className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center gap-2" 
          onClick={handleDisconnect} 
          disabled={disconnecting}
        >
          <LogOut className="w-4 h-4" />
          {disconnecting ? "Disconnecting..." : "Disconnect"}
        </Button>
      </div>
    </div>
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-6 bg-white/5 h-32 relative overflow-hidden">
            <div className="absolute inset-0 shimmer"></div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6 bg-white/5 h-96 relative overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="w-64 hidden md:block border-r border-white/10 min-h-screen p-5">
          <SidebarContent />
        </aside>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              className="fixed top-4 left-4 z-40 md:hidden bg-neon-orange hover:bg-orange-700"
              size="icon"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-black border-white/10 p-5">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        <main className="flex-1 px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neon-orange ml-14 md:ml-0">
              YouTube Studio
            </h1>
            <div className="flex gap-2 ml-14 md:ml-0">
              <Button 
                className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                onClick={handleRefresh} 
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{refreshing ? "Updating..." : "Refresh"}</span>
              </Button>
              <Button 
                className="bg-neon-orange hover:bg-orange-700 text-white font-bold transition-all duration-200 flex items-center gap-2" 
                onClick={handleConnectYoutube} 
                disabled={connecting}
              >
                <Youtube className="w-4 h-4" />
                <span className="hidden sm:inline">{connecting ? "Connecting..." : "Connect"}</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="mb-6">
                {channelTitle ? (
                  <div className="text-lg text-white/80 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-neon-orange" />
                    Channel: <span className="font-semibold text-white">{channelTitle}</span>
                  </div>
                ) : (
                  <div className="text-sm text-white/60">No channel connected — click "Connect YouTube".</div>
                )}
              </div>

              {activeTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-2xl p-6 glass glass-border hover-lift transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold text-white/70">Subscribers</div>
                        <Users className="w-5 h-5 text-neon-orange" />
                      </div>
                      <div className="text-4xl font-extrabold text-neon-orange">{stats.subs.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl p-6 glass glass-border hover-lift transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold text-white/70">Total Views</div>
                        <Eye className="w-5 h-5 text-neon-orange" />
                      </div>
                      <div className="text-4xl font-extrabold text-neon-orange">{stats.views.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl p-6 glass glass-border hover-lift transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold text-white/70">Total Videos</div>
                        <Video className="w-5 h-5 text-neon-orange" />
                      </div>
                      <div className="text-4xl font-extrabold text-neon-orange">{stats.videos.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <input
                      value={vSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVSearch(e.target.value)}
                      placeholder="Search video titles..."
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <input
                      type="date"
                      value={vFrom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVFrom(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <input
                      type="date"
                      value={vTo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVTo(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <Button 
                      className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                      onClick={exportVideosCSV}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </div>

                  <div className="rounded-2xl p-6 glass glass-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Video className="w-5 h-5 text-neon-orange" />
                        Recent Videos
                      </h2>
                      <div className="text-sm text-white/50">{filteredVideos.length} items</div>
                    </div>
                    {filteredVideos.length === 0 ? (
                      <div className="text-white/60 text-sm">No videos match the filters.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredVideos.map((v: YTVideo) => (
                          <a
                            key={v.id}
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 hover-lift group"
                          >
                            <img 
                              src={v.thumbnail} 
                              alt={v.title} 
                              className="w-40 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                            <div className="flex-1">
                              <div className="font-semibold line-clamp-2 group-hover:text-neon-orange transition-colors">{v.title}</div>
                              <div className="text-xs text-white/60 mt-1 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(v.publishedAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-white/60 flex items-center gap-2 mt-1">
                                <Eye className="w-3 h-3" />
                                {v.views.toLocaleString()} views
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {analytics ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="rounded-2xl p-6 glass glass-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-semibold">Total Views</div>
                            <TrendingUp className="w-5 h-5 text-neon-orange" />
                          </div>
                          <div className="text-3xl font-bold text-neon-orange">{analytics.totalViews.toLocaleString()}</div>
                          <div className="text-xs text-white/60 mt-1">Last 12 months</div>
                        </div>
                        <div className="rounded-2xl p-6 glass glass-border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-semibold">Total Videos</div>
                            <Video className="w-5 h-5 text-neon-orange" />
                          </div>
                          <div className="text-3xl font-bold text-neon-orange">{analytics.totalVideos.toLocaleString()}</div>
                          <div className="text-xs text-white/60 mt-1">Last 12 months</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl p-6 glass glass-border">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-neon-orange" />
                              Views Trend
                            </h2>
                            <div className="text-xs text-white/60">
                              Updated: {new Date(analytics.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="h-64">
                            {viewsChartData && <Line data={viewsChartData} options={chartOptions} />}
                          </div>
                        </div>
                        <div className="rounded-2xl p-6 glass glass-border">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                              <Video className="w-5 h-5 text-neon-orange" />
                              Videos per Month
                            </h2>
                          </div>
                          <div className="h-64">
                            {videosChartData && <Bar data={videosChartData} options={chartOptions} />}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-white/60 py-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-white/20" />
                      No analytics data available
                    </div>
                  )}
                </div>
              )}

              {activeTab === "composer" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-2xl p-6 glass glass-border lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neon-orange" />
                      AI Composer
                    </h2>
                    <div className="space-y-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Write video idea or key points..."
                        className="w-full rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-neon-orange transition-colors resize-none"
                      />
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="text-white/70">Tone:</span>
                        {(["neutral", "friendly", "professional", "energetic"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-3 py-1 rounded transition-all duration-200 ${
                              tone === t ? "bg-neon-orange text-black font-semibold" : "bg-white/10 hover:bg-white/20"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <Button
                        className="bg-neon-orange hover:bg-orange-700 transition-all duration-200 flex items-center gap-2"
                        onClick={handleGenerate}
                        disabled={genLoading || !prompt.trim()}
                      >
                        <Sparkles className={`w-4 h-4 ${genLoading ? 'animate-spin' : ''}`} />
                        {genLoading ? "Generating..." : "Generate"}
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/60 mb-1">Title</div>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-2 outline-none focus:border-neon-orange transition-colors"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">Hashtags</div>
                          <input
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-2 outline-none focus:border-neon-orange transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Description</div>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={6}
                          className="w-full rounded-lg bg-white/5 border border-white/10 p-3 outline-none focus:border-neon-orange transition-colors resize-none"
                        />
                      </div>
                      <Button
                        className="bg-white/10 hover:bg-white/20 transition-all duration-200"
                        onClick={handleSaveDraft}
                        disabled={saving || !title.trim()}
                      >
                        {saving ? "Saving..." : "Save draft"}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-2xl p-6 glass glass-border">
                    <h3 className="text-lg font-bold mb-3">Drafts</h3>
                    {drafts.length === 0 ? (
                      <div className="text-sm text-white/60">No saved drafts.</div>
                    ) : (
                      <div className="space-y-3">
                        {drafts.map((d: Draft) => (
                          <div key={d.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
                            <div className="text-xs text-white/60 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(d.created_at).toLocaleDateString()}
                            </div>
                            <div className="font-semibold line-clamp-1 mt-1">{d.title}</div>
                            <div className="text-xs text-white/60 line-clamp-2 mt-1">{d.hashtags}</div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className="flex-1 bg-white/10 hover:bg-white/20 text-xs transition-all duration-200"
                                onClick={() => {
                                  setTitle(d.title);
                                  setDescription(d.description);
                                  setHashtags(d.hashtags);
                                }}
                              >
                                Use
                              </Button>
                              <Button 
                                className="flex-1 bg-red-600 hover:bg-red-700 text-xs transition-all duration-200" 
                                onClick={() => handleDeleteDraft(d.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="rounded-2xl p-6 glass glass-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-neon-orange" />
                    Recent Comments
                  </h2>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <input
                      value={cSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCSearch(e.target.value)}
                      placeholder="Search comments/names..."
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <input
                      type="date"
                      value={cFrom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCFrom(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <input
                      type="date"
                      value={cTo}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCTo(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-neon-orange transition-colors"
                    />
                    <Button 
                      className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                      onClick={exportCommentsCSV}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                  </div>

                  {filteredComments.length === 0 ? (
                    <div className="text-white/60 text-sm">No comments match the filters.</div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {paginatedComments.map((c: YTComment) => (
                          <div 
                            key={c.id} 
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-neon-orange/30"
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="font-semibold text-neon-orange">{c.author}</div>
                              <div className="text-xs text-white/60 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(c.publishedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-white/90 whitespace-pre-wrap mb-3">{c.text}</div>
                            <div className="flex items-center justify-between text-xs text-white/60">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {c.likes} likes
                              </div>
                              <a 
                                className="text-neon-orange hover:underline flex items-center gap-1" 
                                href={c.videoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                              >
                                <Video className="w-3 h-3" />
                                View video
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => setCommentsPage(p => Math.max(1, p - 1))}
                            disabled={commentsPage === 1}
                            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                          >
                            Previous
                          </Button>
                          <div className="text-sm text-white/70 px-4">
                            Page {commentsPage} of {totalPages}
                          </div>
                          <Button
                            onClick={() => setCommentsPage(p => Math.min(totalPages, p + 1))}
                            disabled={commentsPage === totalPages}
                            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-all duration-200"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="rounded-2xl p-6 glass glass-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-neon-orange" />
                      Channel Information
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Channel Name</span>
                        <span className="font-semibold">{channelTitle || "Not connected"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Connected Account</span>
                        <span className="font-semibold">{channelEmail || "Not connected"}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Subscribers</span>
                        <span className="font-semibold text-neon-orange">{stats.subs.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Total Views</span>
                        <span className="font-semibold text-neon-orange">{stats.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/70">Total Videos</span>
                        <span className="font-semibold text-neon-orange">{stats.videos.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 glass glass-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <SettingsIcon className="w-5 h-5 text-neon-orange" />
                      Data Management
                    </h2>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="font-semibold mb-2">Auto-refresh</div>
                        <div className="text-sm text-white/60 mb-3">
                          Manually refresh your YouTube data to get the latest statistics, videos, and comments.
                        </div>
                        <Button 
                          className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                          onClick={handleRefresh} 
                          disabled={refreshing}
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                          {refreshing ? "Refreshing..." : "Refresh Now"}
                        </Button>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <div className="font-semibold mb-2">Export Data</div>
                        <div className="text-sm text-white/60 mb-3">
                          Export your videos and comments data to CSV files for backup or analysis.
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                            onClick={exportVideosCSV}
                          >
                            <Download className="w-4 h-4" />
                            Export Videos
                          </Button>
                          <Button 
                            className="bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center gap-2" 
                            onClick={exportCommentsCSV}
                          >
                            <Download className="w-4 h-4" />
                            Export Comments
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 glass glass-border border-red-500/30">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                      <LogOut className="w-5 h-5" />
                      Danger Zone
                    </h2>
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <div className="font-semibold mb-2">Disconnect YouTube</div>
                      <div className="text-sm text-white/60 mb-3">
                        This will remove your YouTube connection and all associated data from this dashboard.
                      </div>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center gap-2" 
                        onClick={handleDisconnect} 
                        disabled={disconnecting}
                      >
                        <LogOut className="w-4 h-4" />
                        {disconnecting ? "Disconnecting..." : "Disconnect YouTube"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
