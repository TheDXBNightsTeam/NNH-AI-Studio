'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Clock, 
  Calendar, 
  MapPin, 
  Star, 
  Zap, 
  MessageSquare, 
  HelpCircle, 
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Target,
  Trophy,
  BarChart3,
  Lightbulb,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  // Placeholder data - all static for now
  const lastUpdatedMinutes = 5;
  const activeLocation = {
    name: "The DXB Night Club ...",
    rating: 4.3,
    isConnected: true,
  };
  
  const stats = {
    healthScore: 60,
    totalLocations: 1,
    averageRating: 4.0,
    totalReviews: 412,
    responseRate: 0.5,
    responseTarget: 90,
  };

  const pendingCounts = {
    reviews: 45,
    questions: 7,
  };

  const weeklyTasks = [
    { id: 1, title: "Complete GMB Profile", emoji: "✅", priority: "MEDIUM", duration: "10 min" },
    { id: 2, title: "Upload 5 New Photos", emoji: "📸", priority: "MEDIUM", duration: "20 min" },
    { id: 3, title: "Create a GMB Post", emoji: "📝", priority: "LOW", duration: "15 min" },
  ];

  const alerts = [
    { id: 1, priority: "HIGH", message: "450 reviews awaiting response.", color: "red" },
    { id: 2, priority: "HIGH", message: "7 customer questions need answering", color: "red" },
    { id: 3, priority: "MEDIUM", message: "Response rate (0.5%) is below target...", color: "yellow" },
  ];

  const topPerformer = {
    name: "The DXB Night Club",
    nameAr: "نادي دبي الليلي",
    rating: 4.8,
    reviews: 412,
    change: 100.0,
    pendingReviews: 445,
  };

  const performanceComparison = {
    questions: { value: 2, change: 2.0, trend: "up" },
    rating: { value: 4.0, change: 100.0, trend: "up" },
    reviews: { value: 0, change: 12.0, trend: "down" },
  };

  const insights = [
    { id: 1, title: "Rating Trending Up", emoji: "📈", borderColor: "green" },
    { id: 2, title: "Improve Response Rate", emoji: "⚠️", borderColor: "orange" },
    { id: 3, title: "Questions Need Answers", emoji: "❓", borderColor: "red" },
  ];

  const achievements = [
    { label: "Response Rate", current: 0, target: 90, gradient: "from-orange-500 to-orange-600" },
    { label: "Health Score", current: 60, target: 100, gradient: "from-orange-500 to-yellow-500" },
    { label: "Reviews Count", current: 412, target: 500, gradient: "from-blue-500 to-blue-600" },
  ];
  
  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 flex items-center gap-2">
              🤖 AI Command Center
            </h1>
            <p className="text-zinc-400 mt-2 text-sm md:text-base">
              Proactive risk and growth optimization dashboard
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-zinc-300">
                  Last Updated: {lastUpdatedMinutes} minutes ago
                </span>
              </CardContent>
            </Card>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => console.log('Refresh clicked')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>

        {/* TIME FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-orange-500/20 text-zinc-300 hover:border-orange-500/50 hover:bg-orange-500/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button 
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-orange-500/20 text-zinc-300 hover:border-orange-500/50 hover:bg-orange-500/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 90 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-orange-500/20 text-zinc-300 hover:border-orange-500/50 hover:bg-orange-500/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Custom
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Reset
          </Button>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Location Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  📍 Active Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={activeLocation.isConnected ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30"}>
                    {activeLocation.isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => console.log('Sync Now clicked')}
                  >
                    Sync Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => console.log('Disconnect clicked')}
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2 border border-zinc-700/50">
                  <p className="text-zinc-100 font-medium truncate">{activeLocation.name}</p>
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{activeLocation.rating} / 5.0</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 mt-2"
                    onClick={() => console.log('Go to Location clicked')}
                  >
                    Go to Location →
                  </Button>
                </div>
        </CardContent>
      </Card>

            {/* Quick Actions Section */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-zinc-100 flex items-center gap-2">
                    ⚡ Quick Actions
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-orange-400 hover:text-orange-300"
                    onClick={() => console.log('Sync All clicked')}
                  >
                    Sync All
                  </Button>
                </div>
      </CardHeader>
      <CardContent className="space-y-3">
                <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-orange-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💬</span>
                        <div>
                          <p className="text-zinc-100 font-medium">Reply to Reviews</p>
                          <p className="text-zinc-400 text-sm">Respond to pending reviews</p>
          </div>
        </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        + {pendingCounts.reviews} pending
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-orange-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">❓</span>
                        <div>
                          <p className="text-zinc-100 font-medium">Answer Questions</p>
                          <p className="text-zinc-400 text-sm">Reply to customer questions</p>
            </div>
            </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        + {pendingCounts.questions} pending
                      </Badge>
            </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-orange-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="text-zinc-100 font-medium">Create New Post</p>
                        <p className="text-zinc-400 text-sm">Share updates with customers</p>
          </div>
        </div>
                  </CardContent>
                </Card>
      </CardContent>
    </Card>
          </div>

          {/* CENTER COLUMN */}
          <div className="lg:col-span-1 space-y-4">
            {/* GMB Health Score Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                  🏥 GMB Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-zinc-100 mb-2">{stats.healthScore}%</div>
                <p className="text-zinc-400 text-sm mb-3">Visibility and Compliance</p>
                <Progress value={stats.healthScore} className="h-2 bg-zinc-800" />
              </CardContent>
      </Card>

            {/* Total Locations Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                  📍 Total Locations
                </CardTitle>
      </CardHeader>
      <CardContent>
                <div className="text-4xl font-bold text-zinc-100 mb-2">{stats.totalLocations}</div>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  ↑ vs last period
                </p>
      </CardContent>
    </Card>

            {/* Average Rating Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                  ⭐ Average Rating
                </CardTitle>
    </CardHeader>
    <CardContent>
                <div className="text-4xl font-bold text-zinc-100 mb-2">{stats.averageRating}/5.0</div>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  ↑ {performanceComparison.rating.change}%
      </p>
    </CardContent>
  </Card>

            {/* Total Reviews Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                  💬 Total Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-zinc-100 mb-2">{stats.totalReviews}</div>
                <p className="text-zinc-400 text-sm">vs last period</p>
              </CardContent>
            </Card>

            {/* Response Rate Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                  📈 Response Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-400 mb-2">{stats.responseRate}%</div>
                <p className="text-zinc-400 text-sm mb-3">Target: {stats.responseTarget}%</p>
                <Progress value={stats.responseRate} className="h-2 bg-zinc-800" />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weekly Tasks Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  ⚡ Weekly Tasks
                </CardTitle>
                <p className="text-zinc-400 text-sm mt-1">
                  AI-powered recommendations to improve your business
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Empty State */}
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl">⚡</div>
                  <div>
                    <p className="text-zinc-300 font-medium">No personalized tasks yet</p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Generate your personalized recommendations...
                    </p>
                  </div>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => console.log('Generate Weekly Tasks clicked')}
                  >
                    Generate Weekly Tasks
                  </Button>
                </div>

                {/* Recommended Quick Wins */}
                <div className="space-y-3 pt-4 border-t border-zinc-700/50">
                  <h4 className="text-zinc-300 font-medium text-sm">Recommended Quick Wins</h4>
                  {weeklyTasks.map((task) => (
                    <Card key={task.id} className="bg-zinc-800/50 border-zinc-700/50">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{task.emoji}</span>
                          <div>
                            <p className="text-zinc-100 text-sm font-medium">{task.title}</p>
                            <p className="text-zinc-500 text-xs">{task.duration}</p>
                          </div>
                        </div>
                        <Badge 
                          className={
                            task.priority === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            task.priority === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                            "bg-green-500/20 text-green-400 border-green-500/30"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profile Protection Card */}
            <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  🛡️ Profile Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-5xl font-bold text-zinc-100 text-center">0/1</div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <span>⚠️</span>
                    <span>Remove health score to activate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <span>⚠️</span>
                    <span>Pending weekly email provision</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => console.log('Manage Protection clicked')}
                >
                  Manage Protection
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Risk & Opportunity Feed */}
          <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
      <div className="flex items-center justify-between">
        <div>
                  <CardTitle className="text-zinc-100 flex items-center gap-2">
                    🎯 AI Risk & Opportunity Feed
                  </CardTitle>
                  <p className="text-zinc-400 text-sm mt-1">
                    Proactive alerts and recommended actions
                  </p>
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {alerts.length} alerts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id}
                  className={`bg-zinc-800/50 border-l-4 ${
                    alert.color === "red" ? "border-red-500" : 
                    alert.color === "yellow" ? "border-yellow-500" : 
                    "border-blue-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge 
                          className={`mb-2 ${
                            alert.priority === "HIGH" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                            "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {alert.priority} PRIORITY
                        </Badge>
                        <p className="text-zinc-200 text-sm">{alert.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Location Highlights */}
          <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                📍 Location Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏆</span>
                  <h4 className="text-zinc-300 font-medium">Top Performer</h4>
                </div>
                <Card className="bg-zinc-800/50 border-zinc-700/50">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-zinc-100 font-medium">{topPerformer.name}</p>
                      <p className="text-zinc-500 text-sm">{topPerformer.nameAr}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-zinc-300">{topPerformer.rating} / 5.0</span>
                    </div>
                    <p className="text-zinc-400 text-sm">{topPerformer.reviews} reviews</p>
                    <p className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{topPerformer.change}%
                    </p>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 w-fit">
                      {topPerformer.pendingReviews} pending reviews
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                      onClick={() => console.log('View Details clicked')}
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                📊 Performance Comparison
              </CardTitle>
              <p className="text-zinc-400 text-sm mt-1">
                Compare this month vs last month performance
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <p className="text-zinc-400 text-xs mb-1">Questions</p>
                  <p className="text-zinc-100 text-xl font-bold">{performanceComparison.questions.value}</p>
                  <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    ↑ +{performanceComparison.questions.change}%
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <p className="text-zinc-400 text-xs mb-1">Rating</p>
                  <p className="text-zinc-100 text-xl font-bold">{performanceComparison.rating.value}</p>
                  <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    ↑ +{performanceComparison.rating.change}%
                  </p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                  <p className="text-zinc-400 text-xs mb-1">Reviews</p>
                  <p className="text-zinc-100 text-xl font-bold">{performanceComparison.reviews.value}</p>
                  <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3" />
                    ↓ -{performanceComparison.reviews.change}%
          </p>
        </div>
      </div>

              <div className="bg-zinc-800/50 rounded-lg p-8 border border-zinc-700/50 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-zinc-500 text-sm">📈 Chart Area</p>
        </div>
      </div>

              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-zinc-400">Questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-zinc-400">Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-zinc-400">Reviews</span>
        </div>
      </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                💡 AI Insights
              </CardTitle>
              <p className="text-zinc-400 text-sm mt-1">
                Smart recommendations based on your data analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <Card 
                  key={insight.id}
                  className={`bg-zinc-800/50 border-l-4 ${
                    insight.borderColor === "green" ? "border-green-500" :
                    insight.borderColor === "orange" ? "border-orange-500" :
                    "border-red-500"
                  }`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{insight.emoji}</span>
                    <p className="text-zinc-200 text-sm font-medium flex-1">{insight.title}</p>
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-700/50">
                <Settings className="w-3 h-3" />
                <span>⚙️ Auto-updated based on latest data</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACHIEVEMENTS & PROGRESS */}
        <Card className="bg-zinc-900/50 border-orange-500/20 backdrop-blur-sm hover:border-orange-500/50 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              🏆 Achievements & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => {
              const percentage = (achievement.current / achievement.target) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{achievement.label}</span>
                    <span className="text-zinc-400">
                      {achievement.current} / {achievement.target}
                    </span>
                  </div>
                  <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${achievement.gradient} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
        </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
