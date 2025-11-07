'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/lib/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LocationHighlight {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  pendingReviews: number;
  ratingChange?: number;
  category: 'top' | 'attention' | 'improved';
}

interface LocationHighlightsCarouselProps {
  locations: LocationHighlight[];
  loading?: boolean;
}

export function LocationHighlightsCarousel({
  locations,
  loading = false
}: LocationHighlightsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    if (locations.length <= 1) return;
    
    const timer = setInterval(() => {
      setNextAnimate();
    }, 5000); // every 5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, locations.length]);

  const setNext = () => {
    setCurrentIndex((prev) => (prev + 1) % locations.length);
  };

  const setPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length);
  };

  const setNextAnimate = () => {
    setCurrentIndex((prev) => (prev + 1) % locations.length);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Highlights</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Highlights</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              No locations available
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Google My Business account to see location statistics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLocation = locations[currentIndex];

  const categoryConfig = {
    top: {
      label: '🏆 Top Performer',
      icon: Award,
      color: 'text-warning',
      bgColor: 'bg-gradient-to-br from-warning/10 to-warning/5',
      borderColor: 'border-warning/30',
      description: 'Highest rating across all locations'
    },
    attention: {
      label: '⚠️ Needs Attention',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-gradient-to-br from-destructive/10 to-destructive/5',
      borderColor: 'border-destructive/30',
      description: 'Requires responses or improvements'
    },
    improved: {
      label: '📈 Most Improved',
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-gradient-to-br from-success/10 to-success/5',
      borderColor: 'border-success/30',
      description: 'Biggest rating improvement'
    }
  };

  const config = categoryConfig[currentLocation.category];
  const Icon = config.icon;

  return (
    <Card className={cn("border-2", config.borderColor)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location Highlights
          </CardTitle>
          
          {locations.length > 1 && (
            <div className="flex items-center gap-2" role="group" aria-label="Navigate between locations">
              <Button
                variant="ghost"
                size="icon"
                onClick={setPrevious}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (e.key === 'ArrowLeft') {
                      setPrevious();
                    } else {
                      setNext();
                    }
                  }
                }}
                className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Previous location"
                aria-describedby="location-counter"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </Button>
              <span 
                id="location-counter" 
                className="text-sm text-muted-foreground" 
                aria-live="polite"
                aria-atomic="true"
              >
                {currentIndex + 1} / {locations.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={setNext}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (e.key === 'ArrowRight') {
                      setNext();
                    } else {
                      setPrevious();
                    }
                  }
                }}
                className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Next location"
                aria-describedby="location-counter"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLocation.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={cn("p-6 rounded-lg", config.bgColor)}
            role="region"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Location details: ${currentLocation.name}`}
          >
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("p-2 rounded-lg bg-background/80", config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{config.label}</h3>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-bold text-foreground mb-1">
                  {currentLocation.name}
                </h4>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-semibold">{currentLocation.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>

                  {/* Review Count */}
                  <div className="text-sm text-muted-foreground">
                    {currentLocation.reviewCount} reviews
                  </div>

                  {/* Rating Change */}
                  {currentLocation.ratingChange !== undefined && currentLocation.ratingChange !== 0 && (
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      currentLocation.ratingChange > 0 ? "text-success" : "text-destructive"
                    )}>
                      {currentLocation.ratingChange > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {currentLocation.ratingChange > 0 ? '+' : ''}
                      {currentLocation.ratingChange.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Reviews Alert */}
              {currentLocation.pendingReviews > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-warning/10 border border-warning/30">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-warning">
                    {currentLocation.pendingReviews} pending reviews
                  </span>
                </div>
              )}

              {/* Action Button */}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/locations?id=${currentLocation.id}`}>
                  View Details
                </Link>
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicators */}
        {locations.length > 1 && (
          <div 
            className="flex items-center justify-center gap-2 mt-4"
            role="tablist"
            aria-label="Location indicators"
          >
            {locations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentIndex(index);
                  }
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
                  index === currentIndex 
                    ? "w-8 bg-primary" 
                    : "w-1.5 bg-muted-foreground/30"
                )}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Location ${index + 1}`}
                tabIndex={index === currentIndex ? 0 : -1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
