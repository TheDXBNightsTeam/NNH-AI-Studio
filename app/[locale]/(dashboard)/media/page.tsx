import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { MediaContainer } from './MediaClient';

// TypeScript Interfaces
interface MediaItem {
  id: string;
  location_id: string;
  url: string;
  type: string | null; // 'PHOTO', 'VIDEO', etc.
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string | null;
  metadata?: any;
  gmb_locations?: {
    id: string;
    location_name: string;
  } | null;
}

interface MediaStats {
  totalPhotos: number;
  totalVideos: number;
  totalSize: string;
  locationsWithMedia: number;
}

// Data Fetching Function
async function getMediaData() {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // Fetch all media with location info
    const { data: media, error } = await supabase
      .from('gmb_media')
      .select(`
        *,
        gmb_locations (
          id,
          location_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Media fetch error:', error);
      return [];
    }
    
    return media || [];
  } catch (error) {
    console.error('Media fetch error:', error);
    return [];
  }
}

// Stats Calculation Function
function calculateMediaStats(media: MediaItem[]): MediaStats {
  const photos = media.filter(m => m.type === 'PHOTO' || m.type === 'photo');
  const videos = media.filter(m => m.type === 'VIDEO' || m.type === 'video');
  
  // Calculate total size from metadata if available
  const totalBytes = media.reduce((sum, m) => {
    if (m.metadata && typeof m.metadata === 'object' && 'fileSize' in m.metadata) {
      return sum + (Number(m.metadata.fileSize) || 0);
    }
    return sum;
  }, 0);
  
  const totalSize = totalBytes > 1024 * 1024 * 1024 
    ? `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : totalBytes > 1024 * 1024
    ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(totalBytes / 1024).toFixed(1)} KB`;
  
  const uniqueLocations = new Set(media.map(m => m.location_id).filter(Boolean));
  
  return {
    totalPhotos: photos.length,
    totalVideos: videos.length,
    totalSize: totalBytes > 0 ? totalSize : '0 KB',
    locationsWithMedia: uniqueLocations.size
  };
}

// Stats Card Component
function MediaStatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'orange' | 'green';
}) {
  const colorClasses = {
    blue: 'border-blue-500/20 hover:border-blue-500/50',
    purple: 'border-purple-500/20 hover:border-purple-500/50',
    orange: 'border-orange-500/20 hover:border-orange-500/50',
    green: 'border-green-500/20 hover:border-green-500/50'
  };
  
  return (
    <Card className={`
      bg-zinc-900/50 border rounded-xl p-6 
      ${colorClasses[color]}
      transition-all hover:transform hover:-translate-y-1
    `}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <span className="text-zinc-400 text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </Card>
  );
}

// Main Component
export default async function MediaPage() {
  const media = await getMediaData();
  const stats = calculateMediaStats(media);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dashboard:refresh'));
    console.log('[MediaPage] Media data fetched, dashboard refresh triggered');
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📸 Media Library
            </h1>
            <p className="text-zinc-400">
              Manage your location photos and videos
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MediaStatsCard
            title="Total Photos"
            value={stats.totalPhotos}
            icon="📷"
            color="blue"
          />
          <MediaStatsCard
            title="Total Videos"
            value={stats.totalVideos}
            icon="🎥"
            color="purple"
          />
          <MediaStatsCard
            title="Storage Used"
            value={stats.totalSize}
            icon="💾"
            color="orange"
          />
          <MediaStatsCard
            title="Locations"
            value={stats.locationsWithMedia}
            icon="📍"
            color="green"
          />
        </div>
        
        {/* Filters & Search + Media Grid */}
        <MediaContainer media={media} totalCount={media.length} />
        
      </div>
    </div>
  );
}
