"use client";

import React from 'react';
import { MapPin, Phone, Globe, CheckCircle2 } from 'lucide-react';
import { FloatingCard } from './floating-card';
import { Button } from '@/components/ui/button';
import { Location } from '@/components/locations/location-types';
import { useRouter } from '@/lib/navigation';

interface LocationDetailsCardProps {
  location: Location | null;
}

/**
 * Compact quick-glance card shown above the map
 */
export function LocationDetailsCard({ location }: LocationDetailsCardProps) {
  const router = useRouter();

  if (!location) {
    return null;
  }

  const coverImageUrl =
    location.coverImageUrl || (location.metadata?.profile?.coverPhotoUrl as string | undefined);
  const logoImageUrl =
    location.logoImageUrl || (location.metadata?.profile?.logoUrl as string | undefined);
  const hasCover = Boolean(coverImageUrl);
  const hasLogo = Boolean(logoImageUrl);

  const goToBranding = () => router.push('/settings/branding');

  return (
    <FloatingCard position="top-right" delay={0.2} mobilePosition="top" className="w-full max-w-[320px]">
      <div className="space-y-4">
        <div className="relative h-24 w-full overflow-hidden rounded-2xl border border-white/5 bg-black/30">
          {hasCover ? (
            <>
              <img
                src={coverImageUrl!}
                alt={`${location.name} cover`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <button
                type="button"
                onClick={goToBranding}
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-black shadow hover:bg-white"
              >
                Add cover photo
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-black/40">
            {hasLogo ? (
              <img
                src={logoImageUrl!}
                alt={`${location.name} logo`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={goToBranding}
                className="flex h-full w-full items-center justify-center text-xs font-semibold text-white hover:opacity-80"
              >
                Add logo
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">{location.name}</h3>
            {location.address && (
              <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                <span className="line-clamp-2">{location.address}</span>
              </div>
            )}
            {location.status === 'verified' && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {location.phone && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              onClick={() => window.open(`tel:${location.phone}`)}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
          )}
          {(location.coordinates || location.address) && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/10 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
              onClick={() => {
                if (location.coordinates) {
                  const { lat, lng } = location.coordinates;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                } else if (location.address) {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`,
                    '_blank'
                  );
                }
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Directions
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/20 bg-primary/20 text-white hover:border-white/40 hover:bg-primary/30"
            onClick={() => router.push(`/locations/${location.id}`)}
          >
            <Globe className="mr-2 h-4 w-4" />
            View details
          </Button>
        </div>

        {!hasCover || !hasLogo ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
            Personalize this location by uploading branding assets in Settings → Branding.
          </div>
        ) : null}
      </div>
    </FloatingCard>
  );
}

