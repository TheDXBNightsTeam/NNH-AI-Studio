'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MediaItem {
  id: string;
  location_id: string;
  url: string;
  type: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string | null;
  metadata?: any;
  gmb_locations?: {
    id: string;
    location_name: string;
  } | null;
}

// Media Container Component (manages filter state)
export function MediaContainer({ media, totalCount }: { media: MediaItem[]; totalCount: number }) {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  return (
    <>
      <MediaFilters
        totalCount={totalCount}
        activeTab={activeTab}
        searchQuery={searchQuery}
        sortBy={sortBy}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
        setSortBy={setSortBy}
      />
      <MediaGrid
        media={media}
        activeTab={activeTab}
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </>
  );
}

export function MediaFilters({
  totalCount,
  activeTab,
  searchQuery,
  sortBy,
  setActiveTab,
  setSearchQuery,
  setSortBy
}: {
  totalCount: number;
  activeTab: 'all' | 'photos' | 'videos';
  searchQuery: string;
  sortBy: string;
  setActiveTab: (tab: 'all' | 'photos' | 'videos') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
}) {
  return (
    <div className="space-y-4 mb-6">
      {/* Tabs */}
      <div className="flex gap-3">
        <Button
          onClick={() => setActiveTab('all')}
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          className={activeTab === 'all' ? 'bg-orange-600 text-white' : ''}
        >
          All Media ({totalCount})
        </Button>
        <Button
          onClick={() => setActiveTab('photos')}
          variant={activeTab === 'photos' ? 'default' : 'outline'}
          size="sm"
          className={activeTab === 'photos' ? 'bg-orange-600 text-white' : ''}
        >
          📷 Photos
        </Button>
        <Button
          onClick={() => setActiveTab('videos')}
          variant={activeTab === 'videos' ? 'default' : 'outline'}
          size="sm"
          className={activeTab === 'videos' ? 'bg-orange-600 text-white' : ''}
        >
          🎥 Videos
        </Button>
      </div>
      
      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="date">Sort by Date</option>
          <option value="location">Sort by Location</option>
          <option value="type">Sort by Type</option>
        </select>
        
        <select className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
          <option>All Locations</option>
        </select>
        
        <Button variant="outline" size="sm">
          🎯 Filters
        </Button>
      </div>
    </div>
  );
}

export function MediaGrid({
  media,
  activeTab,
  searchQuery,
  sortBy
}: {
  media: MediaItem[];
  activeTab: 'all' | 'photos' | 'videos';
  searchQuery: string;
  sortBy: string;
}) {
  
  // Filter media
  let filteredMedia = media;
  
  // Filter by tab
  if (activeTab === 'photos') {
    filteredMedia = media.filter(m => m.type === 'PHOTO' || m.type === 'photo');
  } else if (activeTab === 'videos') {
    filteredMedia = media.filter(m => m.type === 'VIDEO' || m.type === 'video');
  }
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredMedia = filteredMedia.filter(m => 
      m.gmb_locations?.location_name.toLowerCase().includes(query) ||
      (m.metadata && JSON.stringify(m.metadata).toLowerCase().includes(query))
    );
  }
  
  // Sort media
  filteredMedia = [...filteredMedia].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'location') {
      const nameA = a.gmb_locations?.location_name || '';
      const nameB = b.gmb_locations?.location_name || '';
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'type') {
      const typeA = a.type || '';
      const typeB = b.type || '';
      return typeA.localeCompare(typeB);
    }
    return 0;
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  if (filteredMedia.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No media yet
        </h3>
        <p className="text-zinc-400 mb-6">
          Upload photos and videos to get started
        </p>
        <Button className="bg-orange-600 hover:bg-orange-700">
          ⬆️ Upload Media
        </Button>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMedia.map((item, index) => (
          <MediaCard
            key={item.id}
            item={item}
            isSelected={selectedItems.has(item.id)}
            onSelect={() => {
              const newSet = new Set(selectedItems);
              if (newSet.has(item.id)) {
                newSet.delete(item.id);
              } else {
                newSet.add(item.id);
              }
              setSelectedItems(newSet);
            }}
            onClick={() => {
              // Find the index in the filtered array
              const filteredIndex = filteredMedia.findIndex(m => m.id === item.id);
              openLightbox(filteredIndex);
            }}
          />
        ))}
      </div>
      
      {lightboxOpen && (
        <MediaLightbox
          media={filteredMedia}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % filteredMedia.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length)}
        />
      )}
    </>
  );
}

function MediaCard({
  item,
  isSelected,
  onSelect,
  onClick
}: {
  item: MediaItem;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const imageUrl = item.thumbnail_url || item.url;
  const isVideo = item.type === 'VIDEO' || item.type === 'video';
  
  return (
    <div className="group relative aspect-square bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition cursor-pointer">
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-orange-600 focus:ring-orange-500 cursor-pointer"
        />
      </div>
      
      {/* Image */}
      <div onClick={onClick} className="w-full h-full relative">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.gmb_locations?.location_name || 'Media'}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-4xl">📸</span>
          </div>
        )}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="text-white text-sm font-medium truncate">
            {item.gmb_locations?.location_name || 'Unknown'}
          </div>
          <div className="text-zinc-400 text-xs">
            {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Type Badge */}
      {isVideo && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          🎥 Video
        </div>
      )}
    </div>
  );
}

function MediaLightbox({
  media,
  currentIndex,
  onClose,
  onNext,
  onPrev
}: {
  media: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const current = media[currentIndex];
  const imageUrl = current?.url || current?.thumbnail_url;
  
  if (!current || !imageUrl) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition z-10"
      >
        ✕
      </button>
      
      {/* Navigation */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition z-10"
          >
            ←
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-white transition z-10"
          >
            →
          </button>
        </>
      )}
      
      {/* Image */}
      <div 
        className="max-w-6xl max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={current.gmb_locations?.location_name || 'Media'}
          width={1200}
          height={800}
          className="object-contain max-h-[90vh] rounded-lg"
          unoptimized
        />
      </div>
      
      {/* Info */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-white text-lg font-medium mb-2">
            {current.gmb_locations?.location_name || 'Unknown Location'}
          </div>
          <div className="text-zinc-400 text-sm">
            {new Date(current.created_at).toLocaleString()} • {currentIndex + 1} of {media.length}
          </div>
        </div>
      </div>
    </div>
  );
}

