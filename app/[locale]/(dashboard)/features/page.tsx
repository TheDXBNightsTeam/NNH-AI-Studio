'use client'

import { useState } from 'react'
import { FeaturesTab, BusinessInfoTab, CategoriesTab, LinksTab, MoreTab } from './TabComponents'
import { ProfileCompletenessCard } from './ProfileCompletenessCard'

// Types
interface BusinessProfile {
  location_id: string
  location_name: string
  
  // Basic Info
  description: string
  short_description: string
  phone: string
  website: string
  
  // Categories
  primary_category: string
  additional_categories: string[]
  
  // Special Links
  menu_url?: string
  booking_url?: string
  order_url?: string
  appointment_url?: string
  
  // Features/Attributes
  features: {
    amenities: string[]
    payment_methods: string[]
    services: string[]
    atmosphere: string[]
  }
  
  // More Attributes
  from_the_business: string[]
  opening_date?: string
  service_area_enabled: boolean
  
  // Completeness
  profile_completeness: number
}

export default function BusinessProfilePage() {
  const [activeTab, setActiveTab] = useState<'features' | 'info' | 'categories' | 'links' | 'more'>('features')
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  const tabs = [
    { id: 'features', name: 'Features', icon: '✨' },
    { id: 'info', name: 'Business Info', icon: '📝' },
    { id: 'categories', name: 'Categories', icon: '🏷️' },
    { id: 'links', name: 'Special Links', icon: '🔗' },
    { id: 'more', name: 'More', icon: '📋' }
  ]
  
  const handleSave = () => {
    window.dispatchEvent(new Event('dashboard:refresh'));
    console.log('[FeaturesPage] Changes saved, dashboard refresh triggered');
    setHasChanges(false);
  };
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ⚙️ Business Profile Settings
            </h1>
            <p className="text-zinc-400">
              Manage all your business information and attributes
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-medium transition text-white"
            >
              🔄 Reset
            </button>
            <button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                hasChanges 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              💾 Save Changes
            </button>
          </div>
        </div>
        
        {/* Location Selector */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <select className="w-full md:w-auto px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-orange-500 focus:outline-none">
            <option>{profile?.location_name ?? 'Select a location'}</option>
          </select>
        </div>
        
        {/* Profile Completeness */}
        <ProfileCompletenessCard completeness={profile?.profile_completeness ?? 0} />
        
        {/* Tabs */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition
                  ${activeTab === tab.id 
                    ? 'bg-orange-600 text-white border-b-2 border-orange-500' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'features' && profile && (
              <FeaturesTab 
                profile={profile} 
                setProfile={setProfile} 
                setHasChanges={setHasChanges}
              />
            )}
            
            {activeTab === 'info' && profile && (
              <BusinessInfoTab 
                profile={profile} 
                setProfile={setProfile} 
                setHasChanges={setHasChanges}
              />
            )}
            
            {activeTab === 'categories' && profile && (
              <CategoriesTab 
                profile={profile} 
                setProfile={setProfile} 
                setHasChanges={setHasChanges}
              />
            )}
            
            {activeTab === 'links' && profile && (
              <LinksTab 
                profile={profile} 
                setProfile={setProfile} 
                setHasChanges={setHasChanges}
              />
            )}
            
            {activeTab === 'more' && profile && (
              <MoreTab 
                profile={profile} 
                setProfile={setProfile} 
                setHasChanges={setHasChanges}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}
