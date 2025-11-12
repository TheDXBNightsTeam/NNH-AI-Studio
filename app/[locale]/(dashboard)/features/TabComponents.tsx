'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import type { BusinessProfile, FeatureCategoryKey, FeatureSelection, SpecialLinks } from '@/types/features'
import { FEATURE_CATALOG } from '@/lib/features/feature-definitions'
import { cn } from '@/lib/utils'

const FEATURE_CATEGORY_KEYS: readonly FeatureCategoryKey[] = ['amenities', 'payment_methods', 'services', 'atmosphere']

const DEFAULT_FEATURES: FeatureSelection = {
  amenities: [],
  payment_methods: [],
  services: [],
  atmosphere: [],
}

const COMMON_CATEGORIES: readonly string[] = [
  'Night club',
  'Bar',
  'Live music venue',
  'Dance club',
  'Cocktail bar',
  'Restaurant',
  'Entertainment venue',
  'Event venue',
  'Lounge',
  'Wine bar',
  'Beer garden',
  'Pub',
  'Sports bar',
  'Karaoke bar',
]

const FROM_BUSINESS_OPTIONS: readonly { key: string; label: string; icon: string }[] = [
  { key: 'black_owned', label: 'Black-owned', icon: '✊🏿' },
  { key: 'women_led', label: 'Women-led', icon: '👩' },
  { key: 'lgbtq_friendly', label: 'LGBTQ+ friendly', icon: '🏳️‍🌈' },
  { key: 'veteran_led', label: 'Veteran-led', icon: '🎖️' },
  { key: 'latino_owned', label: 'Latino-owned', icon: '🌎' },
  { key: 'family_owned', label: 'Family-owned', icon: '👨‍👩‍👧‍👦' },
]

interface TabComponentProps {
  readonly profile: BusinessProfile
  readonly onChange: (next: BusinessProfile) => void
  readonly onDirty: () => void
}

function withUpdatedFeatures(
  profile: BusinessProfile,
  category: FeatureCategoryKey,
  updater: (current: readonly string[]) => readonly string[],
): BusinessProfile {
  const nextFeatures: FeatureSelection = {
    ...DEFAULT_FEATURES,
    ...profile.features,
    [category]: updater(profile.features?.[category] ?? []),
  }

  return {
    ...profile,
    features: nextFeatures,
  }
}

function withUpdatedLinks(profile: BusinessProfile, updater: (current: SpecialLinks) => SpecialLinks): BusinessProfile {
  return {
    ...profile,
    specialLinks: updater(profile.specialLinks ?? {}),
  }
}

function sanitizeUrl(value: string): string {
  return value.trim()
}

export function FeaturesTab({ profile, onChange, onDirty }: TabComponentProps) {
  const allFeatures = FEATURE_CATALOG

  const activeFeatureCount = useMemo(() => {
    return FEATURE_CATEGORY_KEYS.reduce((acc, key) => acc + (profile.features?.[key]?.length ?? 0), 0)
  }, [profile.features])

  const totalFeatureCount = useMemo(() => {
    return FEATURE_CATEGORY_KEYS.reduce((acc, key) => acc + (allFeatures[key]?.length ?? 0), 0)
  }, [allFeatures])

  const handleToggle = (category: FeatureCategoryKey, featureKey: string) => {
    const nextProfile = withUpdatedFeatures(profile, category, (current) => {
      const set = new Set(current)
      if (set.has(featureKey)) {
        set.delete(featureKey)
      } else {
        set.add(featureKey)
      }
      return Array.from(set)
    })

    onChange(nextProfile)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[FeaturesTab] Feature toggled, dashboard refresh triggered')
  }

  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">✨ Features & Attributes</h2>
        <p className="text-zinc-400">Enable features that your business offers to improve discoverability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-1">{activeFeatureCount}</div>
          <div className="text-sm text-zinc-400">Active Features</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-1">{totalFeatureCount}</div>
          <div className="text-sm text-zinc-400">Total Available</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-orange-400 mb-1">{Math.max(totalFeatureCount - activeFeatureCount, 0)}</div>
          <div className="text-sm text-zinc-400">Missing Features</div>
        </div>
      </div>

      {FEATURE_CATEGORY_KEYS.map((category) => {
        const categoryConfig = allFeatures[category] ?? []
        const enabledFeatures = new Set(profile.features?.[category] ?? [])
        const enabledCount = enabledFeatures.size
        const completion = categoryConfig.length > 0 ? Math.round((enabledCount / categoryConfig.length) * 100) : 0

        return (
          <div key={category} className="bg-zinc-800/30 border border-zinc-800 rounded-xl overflow-hidden">
            <FeatureCategorySection
              categoryKey={category}
              name={
                {
                  amenities: 'Basic Amenities',
                  payment_methods: 'Payment Methods',
                  services: 'Services',
                  atmosphere: 'Atmosphere',
                }[category]
              }
              icon={
                {
                  amenities: '🏢',
                  payment_methods: '💳',
                  services: '🛎️',
                  atmosphere: '🎭',
                }[category]
              }
              total={categoryConfig.length}
              completion={completion}
              enabledCount={enabledCount}
            >
              <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryConfig.map((feature) => {
                  const isEnabled = enabledFeatures.has(feature.key)

                  return (
                    <label
                      key={feature.id}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition',
                        isEnabled ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggle(category, feature.key)}
                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{feature.icon}</span>
                          <span className="font-medium text-white text-sm">{feature.name}</span>
                        </div>
                        <div className="text-xs text-zinc-500">{feature.commonPercentage}% have this</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </FeatureCategorySection>
          </div>
        )
      })}
    </div>
  )
}

interface FeatureCategorySectionProps {
  readonly categoryKey: FeatureCategoryKey
  readonly name: string
  readonly icon: string
  readonly total: number
  readonly enabledCount: number
  readonly completion: number
  readonly children: React.ReactNode
}

function FeatureCategorySection({ categoryKey, name, icon, total, enabledCount, completion, children }: FeatureCategorySectionProps) {
  const [isExpanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/50 transition"
        aria-expanded={isExpanded}
        aria-controls={`${categoryKey}-features`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {icon}
          </span>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{name}</h3>
            <p className="text-sm text-zinc-400">
              {enabledCount} of {total} enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-zinc-500">{completion}%</div>
          <span className={cn('text-zinc-400 transition-transform', isExpanded ? 'rotate-180' : '')}>▼</span>
        </div>
      </button>

      {isExpanded && (
        <div id={`${categoryKey}-features`} className="border-t border-zinc-800">
          {children}
        </div>
      )}
    </div>
  )
}

export function BusinessInfoTab({ profile, onChange, onDirty }: TabComponentProps) {
  const handleChange = (field: keyof Pick<BusinessProfile, 'locationName' | 'description' | 'shortDescription' | 'phone' | 'website'>, value: string) => {
    const next: BusinessProfile = {
      ...profile,
      [field]: value,
    }
    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[BusinessInfoTab] Business info updated, dashboard refresh triggered')
  }

  const handleTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleChange('description', event.target.value)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">📝 Business Information</h2>
        <p className="text-zinc-400">Update your core business details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Business Name *</label>
        <input
          type="text"
          value={profile.locationName}
          onChange={(event) => handleChange('locationName', event.target.value)}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          placeholder="Your business name"
        />
        <p className="text-xs text-zinc-500 mt-1">This is how your business appears on Google</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Business Description</label>
        <textarea
          value={profile.description}
          onChange={handleTextArea}
          rows={5}
          maxLength={750}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none resize-none"
          placeholder="Describe your business in detail..."
        />
        <p className="text-xs text-zinc-500 mt-1">{profile.description.length}/750 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Short Description</label>
        <input
          type="text"
          value={profile.shortDescription}
          onChange={(event) => handleChange('shortDescription', event.target.value)}
          maxLength={250}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          placeholder="Brief one-line description"
        />
        <p className="text-xs text-zinc-500 mt-1">
          {profile.shortDescription.length}/250 characters • Shows in search results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Phone Number *</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            placeholder="+971 XX XXX XXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Website URL</label>
          <input
            type="url"
            value={profile.website}
            onChange={(event) => handleChange('website', event.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-2xl" aria-hidden>
            💡
          </span>
          <div>
            <div className="font-medium text-blue-400 mb-1">Pro Tips</div>
            <ul className="text-sm text-blue-300/80 space-y-1">
              <li>• Use a clear, descriptive business name</li>
              <li>• Write a compelling description that includes your main services</li>
              <li>• Add keywords naturally to improve search visibility</li>
              <li>• Keep your phone number and website up to date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategoriesTab({ profile, onChange, onDirty }: TabComponentProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const addCategory = (category: string) => {
    if (profile.additionalCategories.length >= 9 || profile.additionalCategories.includes(category)) {
      return
    }

    const next: BusinessProfile = {
      ...profile,
      additionalCategories: [...profile.additionalCategories, category],
    }

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[CategoriesTab] Category added, dashboard refresh triggered')
  }

  const removeCategory = (category: string) => {
    const next: BusinessProfile = {
      ...profile,
      additionalCategories: profile.additionalCategories.filter((item) => item !== category),
    }

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[CategoriesTab] Category removed, dashboard refresh triggered')
  }

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return COMMON_CATEGORIES.filter(
      (category) =>
        category.toLowerCase().includes(query) &&
        category !== profile.primaryCategory &&
        !profile.additionalCategories.includes(category),
    )
  }, [searchQuery, profile.primaryCategory, profile.additionalCategories])

  const updatePrimaryCategory = (value: string) => {
    const next: BusinessProfile = {
      ...profile,
      primaryCategory: value,
    }
    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[CategoriesTab] Primary category updated, dashboard refresh triggered')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">🏷️ Business Categories</h2>
        <p className="text-zinc-400">Help customers find your business by selecting relevant categories</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Primary Category *</label>
        <select
          value={profile.primaryCategory}
          onChange={(event) => updatePrimaryCategory(event.target.value)}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        >
          {COMMON_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 mt-1">Your main business category - choose the most relevant one</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">
            Additional Categories ({profile.additionalCategories.length}/9)
          </label>
        </div>

        {profile.additionalCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.additionalCategories.map((category) => (
              <div key={category} className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <span className="text-sm text-white">{category}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(category)}
                  className="text-orange-400 hover:text-orange-300"
                  aria-label={`Remove ${category}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search categories..."
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none mb-3"
        />

        <div className="max-h-64 overflow-y-auto space-y-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
          {filteredCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => addCategory(category)}
              disabled={profile.additionalCategories.length >= 9}
              className="w-full text-left px-3 py-2 hover:bg-zinc-800 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              + {category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-2xl" aria-hidden>
            💡
          </span>
          <div>
            <div className="font-medium text-purple-400 mb-1">Category Tips</div>
            <ul className="text-sm text-purple-300/80 space-y-1">
              <li>• Choose categories that accurately describe your business</li>
              <li>• More categories = better discovery in relevant searches</li>
              <li>• Your primary category has the most impact on search</li>
              <li>• You can add up to 9 additional categories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LinksTab({ profile, onChange, onDirty }: TabComponentProps) {
  const handleChange = (key: keyof SpecialLinks, value: string) => {
    const next = withUpdatedLinks(profile, (current) => ({
      ...current,
      [key]: value ? sanitizeUrl(value) : null,
    }))

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[LinksTab] Link updated, dashboard refresh triggered')
  }

  const links: readonly { key: keyof SpecialLinks; label: string; icon: string; placeholder: string; description: string }[] = [
    {
      key: 'menu',
      label: 'Menu URL',
      icon: '🍽️',
      placeholder: 'https://yoursite.com/menu',
      description: 'Link to your menu (for restaurants)',
    },
    {
      key: 'booking',
      label: 'Booking/Reservation URL',
      icon: '📅',
      placeholder: 'https://yoursite.com/book',
      description: 'Direct link for customers to make reservations',
    },
    {
      key: 'order',
      label: 'Order Online URL',
      icon: '🛒',
      placeholder: 'https://yoursite.com/order',
      description: 'Link to online ordering system',
    },
    {
      key: 'appointment',
      label: 'Appointment URL',
      icon: '🗓️',
      placeholder: 'https://yoursite.com/appointment',
      description: 'Link for booking appointments',
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">🔗 Special Links</h2>
        <p className="text-zinc-400">Add direct action links to improve customer experience</p>
      </div>

      {links.map((link) => {
        const value = profile.specialLinks?.[link.key] ?? ''

        return (
          <div key={link.key} className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl" aria-hidden>
                {link.icon}
              </span>
              <div>
                <label className="block text-sm font-medium text-white">{link.label}</label>
                <p className="text-xs text-zinc-500">{link.description}</p>
              </div>
            </div>

            <input
              type="url"
              value={value ?? ''}
              onChange={(event) => handleChange(link.key, event.target.value)}
              placeholder={link.placeholder}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />

            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-sm text-orange-400 hover:text-orange-300"
              >
                Test Link →
              </a>
            )}
          </div>
        )
      })}

      <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-2xl" aria-hidden>
            ✅
          </span>
          <div>
            <div className="font-medium text-green-400 mb-1">Why Add These Links?</div>
            <ul className="text-sm text-green-300/80 space-y-1">
              <li>• Makes it easy for customers to take action directly from Google</li>
              <li>• Increases conversion rates and bookings</li>
              <li>• Shows up as buttons on your Google Business Profile</li>
              <li>• Improves user experience and reduces friction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MoreTab({ profile, onChange, onDirty }: TabComponentProps) {
  const toggleAttribute = (key: string) => {
    const set = new Set(profile.fromTheBusiness)
    if (set.has(key)) {
      set.delete(key)
    } else {
      set.add(key)
    }

    const next: BusinessProfile = {
      ...profile,
      fromTheBusiness: Array.from(set),
    }

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[MoreTab] Attribute toggled, dashboard refresh triggered')
  }

  const updateOpeningDate = (value: string) => {
    const next: BusinessProfile = {
      ...profile,
      openingDate: value || null,
    }

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[MoreTab] Opening date updated, dashboard refresh triggered')
  }

  const updateServiceArea = (checked: boolean) => {
    const next: BusinessProfile = {
      ...profile,
      serviceAreaEnabled: checked,
    }

    onChange(next)
    onDirty()
    window.dispatchEvent(new Event('dashboard:refresh'))
    console.log('[MoreTab] Service area toggled, dashboard refresh triggered')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold text-white mb-2">📋 More Attributes</h2>
        <p className="text-zinc-400">Additional business information and settings</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-3">From the Business</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FROM_BUSINESS_OPTIONS.map((option) => {
            const isChecked = profile.fromTheBusiness.includes(option.key)

            return (
              <label
                key={option.key}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition',
                  isChecked ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50',
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAttribute(option.key)}
                  className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xl" aria-hidden>
                  {option.icon}
                </span>
                <span className="text-white font-medium">{option.label}</span>
              </label>
            )
          })}
        </div>
        <p className="text-xs text-zinc-500 mt-2">These attributes help customers find businesses that align with their values</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Opening Date</label>
        <input
          type="date"
          value={profile.openingDate ?? ''}
          onChange={(event) => updateOpeningDate(event.target.value)}
          className="w-full md:w-auto px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        />
        <p className="text-xs text-zinc-500 mt-1">When did your business first open?</p>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.serviceAreaEnabled}
            onChange={(event) => updateServiceArea(event.target.checked)}
            className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-orange-600 focus:ring-orange-500"
          />
          <div>
            <span className="text-white font-medium">Show service area on map</span>
            <p className="text-xs text-zinc-500 mt-1">Display the geographic area where you provide services</p>
          </div>
        </label>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="text-2xl" aria-hidden>
            ℹ️
          </span>
          <div>
            <div className="font-medium text-white mb-1">About These Settings</div>
            <p className="text-sm text-zinc-400">
              These attributes provide additional context about your business and help customers make informed decisions. They appear on your Google Business Profile and can improve your visibility in relevant searches.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

