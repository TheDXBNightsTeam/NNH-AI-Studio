'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, Star, Phone, Globe, Clock, Users, TrendingUp, TrendingDown,
  Search, Filter, Plus, Edit3, Shield, AlertTriangle, CheckCircle,
  BarChart3, Eye, MessageSquare, Calendar, Camera, Settings,
  Navigation, Wifi, Car, CreditCard, Utensils, ShoppingBag,
  Loader2, RefreshCw, ExternalLink, Copy, QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Types
interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  status: 'verified' | 'pending' | 'suspended';
  category: string;
  coordinates: { lat: number; lng: number };
  hours: BusinessHours;
  attributes: string[];
  photos: number;
  posts: number;
  healthScore: number;
  visibility: number;
  lastSync: Date;
  insights: LocationInsights;
}

interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

interface LocationInsights {
  views: number;
  viewsTrend: number;
  clicks: number;
  clicksTrend: number;
  calls: number;
  callsTrend: number;
  directions: number;
  directionsTrend: number;
  weeklyGrowth: number;
}

// Location Card Component
const LocationCard = ({ location, onEdit, onViewDetails }: {
  location: Location;
  onEdit: (id: string) => void;
  onViewDetails: (id: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {location.name}
              </h3>
              <Badge className={`text-xs ${getStatusColor(location.status)}`}>
                {location.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{location.rating.toFixed(1)}</span>
                <span>({location.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{location.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(location.id)}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onViewDetails(location.id)}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Health Score</span>
          <span className={`text-lg font-bold ${getHealthScoreColor(location.healthScore)}`}>
            {location.healthScore}%
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{location.insights.views.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Views</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              {location.insights.viewsTrend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={location.insights.viewsTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(location.insights.viewsTrend)}%
              </span>
            </div>
          </div>

          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{location.insights.clicks}</div>
            <div className="text-xs text-muted-foreground">Clicks</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              {location.insights.clicksTrend > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={location.insights.clicksTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(location.insights.clicksTrend)}%
              </span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="flex flex-wrap gap-1">
          {location.attributes.slice(0, 3).map((attr, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {attr}
            </Badge>
          ))}
          {location.attributes.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{location.attributes.length - 3} more
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/reviews?location=${location.id}`}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Reviews
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/analytics?location=${location.id}`}>
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </Link>
          </Button>
        </div>

        {/* Last Sync */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last sync: {location.lastSync.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Locations Page
export default function LocationsPage() {
  const supabase = createClient();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  // Sample data - replace with real API calls
  const sampleLocations: Location[] = [
    {
      id: '1',
      name: 'Downtown Coffee Shop',
      address: 'Sheikh Zayed Road, Dubai',
      phone: '+971-4-123-4567',
      website: 'https://downtowncoffee.ae',
      rating: 4.6,
      reviewCount: 324,
      status: 'verified',
      category: 'Coffee Shop',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      hours: {
        monday: '7:00 AM - 10:00 PM',
        tuesday: '7:00 AM - 10:00 PM',
        wednesday: '7:00 AM - 10:00 PM',
        thursday: '7:00 AM - 10:00 PM',
        friday: '7:00 AM - 11:00 PM',
        saturday: '8:00 AM - 11:00 PM',
        sunday: '8:00 AM - 9:00 PM'
      },
      attributes: ['WiFi', 'Outdoor Seating', 'Takeaway', 'Credit Cards'],
      photos: 47,
      posts: 12,
      healthScore: 87,
      visibility: 92,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      insights: {
        views: 12547,
        viewsTrend: 15,
        clicks: 892,
        clicksTrend: 8,
        calls: 156,
        callsTrend: -3,
        directions: 734,
        directionsTrend: 12,
        weeklyGrowth: 7.5
      }
    },
    {
      id: '2',
      name: 'Marina Restaurant',
      address: 'Dubai Marina Walk, Dubai',
      phone: '+971-4-987-6543',
      website: 'https://marinarestaurant.ae',
      rating: 4.3,
      reviewCount: 198,
      status: 'verified',
      category: 'Restaurant',
      coordinates: { lat: 25.0657, lng: 55.1373 },
      hours: {
        monday: '12:00 PM - 11:00 PM',
        tuesday: '12:00 PM - 11:00 PM',
        wednesday: '12:00 PM - 11:00 PM',
        thursday: '12:00 PM - 11:00 PM',
        friday: '12:00 PM - 12:00 AM',
        saturday: '12:00 PM - 12:00 AM',
        sunday: '12:00 PM - 10:00 PM'
      },
      attributes: ['Dine-in', 'Outdoor Seating', 'Reservations', 'Valet Parking'],
      photos: 89,
      posts: 8,
      healthScore: 74,
      visibility: 85,
      lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
      insights: {
        views: 8934,
        viewsTrend: -5,
        clicks: 567,
        clicksTrend: 3,
        calls: 203,
        callsTrend: 18,
        directions: 445,
        directionsTrend: -2,
        weeklyGrowth: 2.1
      }
    },
    {
      id: '3',
      name: 'JBR Beach Cafe',
      address: 'Jumeirah Beach Residence, Dubai',
      phone: '+971-4-555-0123',
      website: 'https://jbrbeach.ae',
      rating: 4.8,
      reviewCount: 456,
      status: 'pending',
      category: 'Cafe',
      coordinates: { lat: 25.0657, lng: 55.1373 },
      hours: {
        monday: '6:00 AM - 11:00 PM',
        tuesday: '6:00 AM - 11:00 PM',
        wednesday: '6:00 AM - 11:00 PM',
        thursday: '6:00 AM - 11:00 PM',
        friday: '6:00 AM - 12:00 AM',
        saturday: '6:00 AM - 12:00 AM',
        sunday: '6:00 AM - 11:00 PM'
      },
      attributes: ['Beach View', 'WiFi', 'Pet Friendly', 'Shisha'],
      photos: 134,
      posts: 15,
      healthScore: 95,
      visibility: 98,
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
      insights: {
        views: 18765,
        viewsTrend: 23,
        clicks: 1245,
        clicksTrend: 31,
        calls: 287,
        callsTrend: 15,
        directions: 987,
        directionsTrend: 28,
        weeklyGrowth: 12.3
      }
    }
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      // Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLocations(sampleLocations);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      // Replace with real sync API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchLocations();
      toast.success('Locations synced successfully!');
    } catch (error) {
      toast.error('Failed to sync locations');
    } finally {
      setSyncing(false);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || location.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getOverallStats = () => {
    const totalViews = locations.reduce((sum, loc) => sum + loc.insights.views, 0);
    const totalClicks = locations.reduce((sum, loc) => sum + loc.insights.clicks, 0);
    const avgRating = locations.reduce((sum, loc) => sum + loc.rating, 0) / locations.length;
    const avgHealthScore = locations.reduce((sum, loc) => sum + loc.healthScore, 0) / locations.length;

    return { totalViews, totalClicks, avgRating, avgHealthScore };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all your business locations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing && 'animate-spin'}`} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.avgRating || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgHealthScore || 0)}%</div>
            <p className="text-xs text-muted-foreground">
              Optimization score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="Coffee Shop">Coffee Shop</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Cafe">Cafe</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={(id) => {
              toast.info(`Edit location ${id}`);
              // Navigate to edit page
            }}
            onViewDetails={(id) => {
              toast.info(`View details for ${id}`);
              // Navigate to details page
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search term'
                : 'Get started by adding your first business location'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}