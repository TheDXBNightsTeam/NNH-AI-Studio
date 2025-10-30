"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type YTStatistics = { subscriberCount?: string; viewCount?: string; videoCount?: string };
type YTMetadata = { email?: string | null; channel_title?: string | null; statistics?: YTStatistics | null };
type YTVideo = { id: string; title: string; thumbnail: string; views: number; publishedAt: string; url: string; };
type YTComment = { id: string; author: string; text: string; likes: number; publishedAt: string; videoUrl: string; };
type YTAnalytics = { lastUpdated: string; months: string[]; viewsPerMonth: number[]; videosPerMonth: number[]; totalViews: number; totalVideos: number; };
type Draft = { id: string; title: string; description: string; hashtags: string; created_at: string };

export default function YoutubeDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [channelTitle, setChannelTitle] = useState<string | null>(null);
  const [stats, setStats] = useState({ subs: 0, views: 0, videos: 0 });
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [comments, setComments] = useState<YTComment[]>([]);
  const [analytics, setAnalytics] = useState<YTAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "composer" | "comments" | "settings">("dashboard");

  // Composer state
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState<"neutral" | "friendly" | "professional" | "energetic">("neutral");
  const [genLoading, setGenLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const fetchFromDB = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("يرجى تسجيل الدخول أولاً");

    const { data, error: qErr } = await supabase
      .from("oauth_tokens")
      .select("provider, account_id, metadata")
      .eq("user_id", user.id)
      .eq("provider", "youtube")
      .maybeSingle();

    if (qErr) throw qErr;
    if (!data) {
      setChannelTitle(null);
      setStats({ subs: 0, views: 0, videos: 0 });
      setVideos([]); setComments([]); setAnalytics(null);
      return false;
    }
    const meta = (data.metadata || {}) as YTMetadata;
    const s = meta.statistics || {};
    setChannelTitle(meta.channel_title || "YouTube Channel");
    setStats({
      subs: Number(s.subscriberCount || 0),
      views: Number(s.viewCount || 0),
      videos: Number(s.videoCount || 0),
    });
    return true;
  };

  // SAFE fetch helpers
  const safeGet = async (url: string) => {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await res.text();
    let js: any = {};
    try { js = JSON.parse(text); } catch { js = {}; }
    if (!res.ok) throw new Error(js.error || text.slice(0, 300) || `GET ${url} failed`);
    return js;
  };
  const safePost = async (url: string, body?: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let js: any = {};
    try { js = JSON.parse(text); } catch { js = {}; }
    if (!res.ok) throw new Error(js.error || text.slice(0, 300) || `POST ${url} failed`);
    return js;
  };
  const safeDelete = async (url: string) => {
    const res = await fetch(url, { method: "DELETE", headers: { Accept: "application/json" } });
    const text = await res.text();
    let js: any = {};
    try { js = JSON.parse(text); } catch { js = {}; }
    if (!res.ok) throw new Error(js.error || text.slice(0, 300) || `DELETE ${url} failed`);
    return js;
  };

  // Data loaders with safe parsing
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

  const handleConnectYoutube = async () => {
    try {
      setConnecting(true);
      const data = await safePost("/api/youtube/create-auth-url", {});
      if (data.authUrl) window.location.href = data.authUrl;
    } catch (e: any) {
      setError(e.message || "Failed to start YouTube connection");
      setConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await safePost("/api/youtube/refresh");
      await Promise.all([fetchFromDB(), fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()]);
    } catch (e: any) {
      setError(e.message || "فشل تحديث البيانات");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("هل تريد فصل YouTube من الحساب؟")) return;
    try {
      setDisconnecting(true);
      await safePost("/api/youtube/disconnect");
      setChannelTitle(null);
      setStats({ subs: 0, views: 0, videos: 0 });
      setVideos([]); setComments([]); setAnalytics(null); setDrafts([]);
    } catch (e: any) {
      setError(e.message || "فشل فصل YouTube");
    } finally {
      setDisconnecting(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const has = await fetchFromDB();
        if (has) { await Promise.all([fetchVideos(), fetchComments(), fetchAnalytics(), fetchDrafts()]); }
      } catch (e: any) {
        setError(e.message || "فشل تحميل بيانات القناة");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topVideos = useMemo(() => [...videos].sort((a, b) => b.views - a.views).slice(0, 8), [videos]);

  const handleGenerate = async () => {
    try {
      setGenLoading(true); setError(null);
      const j = await safePost("/api/youtube/composer/generate", { prompt, tone });
      setTitle(j.title || "");
      setDescription(j.description || "");
      setHashtags(j.hashtags || "");
    } catch (e: any) {
      setError(e.message || "فشل التوليد");
    } finally {
      setGenLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true); setError(null);
      await safePost("/api/youtube/composer/drafts", { title, description, hashtags });
      await fetchDrafts();
    } catch (e: any) {
      setError(e.message || "فشل حفظ المسودة");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await safeDelete(`/api/youtube/composer/drafts?id=${encodeURIComponent(id)}`);
      setDrafts((d) => d.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e.message || "فشل حذف المسودة");
    }
  };

  // Charts (simple inline)
  const ChartBars = ({ labels, values }: { labels: string[]; values: number[] }) => {
    const max = Math.max(1, ...values);
    return (
      <div className="grid grid-cols-12 gap-2 items-end h-48">
        {values.map((v, i) => {
          const h = Math.round((v / max) * 100);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-4 rounded bg-orange-500" style={{ height: `${h}%` }} />
              <div className="text-[10px] text-white/60">{labels[i]?.slice(5)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const ChartLine = ({ labels, values }: { labels: string[]; values: number[] }) => {
    const max = Math.max(1, ...values);
    const pts = values
      .map((v, i) => {
        const x = (i / ((values.length - 1) || 1)) * 100;
        const y = 100 - Math.round((v / max) * 100);
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg viewBox="0 0 100 100" className="w-full h-48 bg-white/5 rounded">
        <polyline fill="none" stroke="#FF6B00" strokeWidth="1.5" points={pts} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <aside className="w-64 hidden md:block border-r border-white/10 min-h-screen p-5">
          <div className="text-neon-orange font-extrabold text-xl mb-6">NNH • YouTube</div>
          <nav className="space-y-2">
            {(["dashboard", "analytics", "composer", "comments", "settings"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`w-full text-left rounded-lg px-3 py-2 transition ${activeTab === t ? "bg-neon-orange text-black font-bold" : "hover:bg-white/10"}`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </nav>
          <div className="mt-8 space-y-2">
            <Button className="w-full bg-white/10 hover:bg-white/20" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? "Updating..." : "Refresh stats"}
            </Button>
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? "Disconnecting..." : "Disconnect YouTube"}
            </Button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-neon-orange">YouTube Studio Dashboard</h1>
            <div className="flex gap-2">
              <Button className="bg-white/10 hover:bg-white/20" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? "Updating..." : "Refresh"}
              </Button>
              <Button className="bg-neon-orange hover:bg-orange-700 text-white font-bold" onClick={handleConnectYoutube} disabled={connecting}>
                {connecting ? "جاري التحويل..." : "ربط YouTube"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              <div className="rounded-2xl p-6 bg-white/5 h-28" />
              <div className="rounded-2xl p-6 bg-white/5 h-28" />
              <div className="rounded-2xl p-6 bg-white/5 h-28" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                {channelTitle ? (
                  <div className="text-lg text-white/80">
                    القناة: <span className="font-semibold text-white">{channelTitle}</span>
                  </div>
                ) : (
                  <div className="text-sm text-white/60">لم يتم ربط قناة بعد — اضغط “ربط YouTube”.</div>
                )}
              </div>

              {activeTab === "dashboard" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-2xl p-6 glass glass-border">
                      <div className="text-2xl font-bold">Subscribers</div>
                      <div className="text-4xl font-extrabold">{stats.subs.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl p-6 glass glass-border">
                      <div className="text-2xl font-bold">Total Views</div>
                      <div className="text-4xl font-extrabold">{stats.views.toLocaleString()}</div>
                    </div>
                    <div className="rounded-2xl p-6 glass glass-border">
                      <div className="text-2xl font-bold">Total Videos</div>
                      <div className="text-4xl font-extrabold">{stats.videos.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 glass glass-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">Recent Videos</h2>
                      <div className="text-sm text-white/50">{videos.length} items</div>
                    </div>
                    {videos.length === 0 ? (
                      <div className="text-white/60 text-sm">لا توجد فيديوهات حديثة أو الصلاحيات غير كافية.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((v) => (
                          <a
                            key={v.id}
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                          >
                            <img src={v.thumbnail} alt={v.title} className="w-40 h-24 rounded-lg object-cover" />
                            <div className="flex-1">
                              <div className="font-semibold line-clamp-2">{v.title}</div>
                              <div className="text-xs text-white/60 mt-1">
                                {new Date(v.publishedAt).toLocaleDateString()} • {v.views.toLocaleString()} views
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "analytics" && analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl p-6 glass glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold">Views (last 12 months)</h2>
                      <div className="text-xs text-white/60">
                        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    <ChartLine labels={analytics.months} values={analytics.viewsPerMonth} />
                  </div>
                  <div className="rounded-2xl p-6 glass glass-border">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold">Videos per month</h2>
                    </div>
                    <ChartBars labels={analytics.months} values={analytics.videosPerMonth} />
                  </div>
                </div>
              )}

              {activeTab === "composer" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-2xl p-6 glass glass-border lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">AI Composer</h2>
                    <div className="space-y-3">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="اكتب فكرة الفيديو أو نقاط رئيسية..."
                        className="w-full rounded-lg bg-white/5 border border-white/10 p-3 outline-none"
                      />
                      <div className="flex items-center gap-2 text-sm">
                        <span>النمط:</span>
                        {(["neutral", "friendly", "professional", "energetic"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-3 py-1 rounded ${tone === t ? "bg-neon-orange text-black" : "bg-white/10 hover:bg-white/20"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <Button
                        className="bg-neon-orange hover:bg-orange-700"
                        onClick={handleGenerate}
                        disabled={genLoading || !prompt.trim()}
                      >
                        {genLoading ? "Generating..." : "Generate"}
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/60 mb-1">Title</div>
                          <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-2 outline-none"
                          />
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">Hashtags</div>
                          <input
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-2 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Description</div>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={6}
                          className="w-full rounded-lg bg-white/5 border border-white/10 p-3 outline-none"
                        />
                      </div>
                      <Button
                        className="bg-white/10 hover:bg-white/20"
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
                      <div className="text-sm text-white/60">لا توجد مسودات محفوظة.</div>
                    ) : (
                      <div className="space-y-3">
                        {drafts.map((d) => (
                          <div key={d.id} className="p-3 rounded-xl bg-white/5">
                            <div className="text-xs text-white/60">{new Date(d.created_at).toLocaleString()}</div>
                            <div className="font-semibold line-clamp-1">{d.title}</div>
                            <div className="text-xs text-white/60 line-clamp-2">{d.hashtags}</div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                className="bg-white/10 hover:bg-white/20"
                                onClick={() => {
                                  setTitle(d.title);
                                  setDescription(d.description);
                                  setHashtags(d.hashtags);
                                }}
                              >
                                Use
                              </Button>
                              <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteDraft(d.id)}>
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
                  <h2 className="text-xl font-bold mb-4">Recent Comments</h2>
                  {comments.length === 0 ? (
                    <div className="text-white/60 text-sm">لا توجد تعليقات حديثة.</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="p-3 rounded-xl bg-white/5">
                          <div className="text-sm text-white/60">{new Date(c.publishedAt).toLocaleString()}</div>
                          <div className="font-semibold">{c.author}</div>
                          <div className="text-white/90 whitespace-pre-wrap mt-1">{c.text}</div>
                          <div className="text-xs text-white/60 mt-2">
                            Likes: {c.likes} •{" "}
                            <a className="text-neon-orange" href={c.videoUrl} target="_blank" rel="noreferrer">
                              Open video
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="rounded-2xl p-6 glass glass-border">
                  <h2 className="text-xl font-bold mb-4">Settings</h2>
                  <div className="space-y-2">
                    <Button className="bg-white/10 hover:bg-white/20" onClick={handleRefresh} disabled={refreshing}>
                      {refreshing ? "Updating..." : "Refresh stats"}
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handleDisconnect} disabled={disconnecting}>
                      {disconnecting ? "Disconnecting..." : "Disconnect YouTube"}
                    </Button>
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