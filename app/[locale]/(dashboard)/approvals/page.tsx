'use client'

/**
 * Approvals & Location Creation Center
 * Phase 2: Complete UI/UX with mock data
 * Phase 3: Real Google API integration
 * 
 * KILLER FEATURE: Create and verify Google Business locations without leaving NNH
 */

import { useState } from 'react'
import { mockLocations } from '@/lib/data/mock-locations'
import { LocationCreationRequest } from '@/lib/types/location-creation'
import { CreateLocationTab } from './components/CreateLocationTab'
import { PendingVerificationTab } from './components/PendingVerificationTab'
import { VerifiedLocationsTab } from './components/VerifiedLocationsTab'
import { IssuesTab } from './components/IssuesTab'

type TabType = 'create' | 'pending' | 'verified' | 'issues'

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('create')
  const [locations, setLocations] = useState<LocationCreationRequest[]>(mockLocations)
  
  // Filter locations by status
  const pendingLocations = locations.filter(l => l.status === 'pending_verification')
  const verifiedLocations = locations.filter(l => l.status === 'verified')
  const issueLocations = locations.filter(l => l.status === 'rejected')
  
  const tabs = [
    { id: 'create' as TabType, name: 'Create Location', icon: '📍', count: null },
    { id: 'pending' as TabType, name: 'Pending Verification', icon: '⏳', count: pendingLocations.length },
    { id: 'verified' as TabType, name: 'Verified', icon: '✅', count: verifiedLocations.length },
    { id: 'issues' as TabType, name: 'Issues', icon: '❌', count: issueLocations.length }
  ]
  
  const handleLocationCreated = (newLocation: LocationCreationRequest) => {
    setLocations([...locations, newLocation])
    setActiveTab('pending')
  }
  
  const handleVerificationComplete = (locationId: string, code: string) => {
    setLocations(locations.map(loc => 
      loc.id === locationId 
        ? {
            ...loc,
            status: 'verified',
            verification: {
              ...loc.verification,
              code,
              completed_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          }
        : loc
    ))
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ✅ Approvals & Location Management
            </h1>
            <p className="text-zinc-400">
              Create new Google Business locations and manage verification process
            </p>
          </div>
          
          <button 
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition flex items-center gap-2 text-white"
          >
            ➕ Create New Location
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Locations"
            value={locations.length}
            icon="📍"
            color="blue"
            subtitle="All locations"
          />
          <StatsCard
            title="Pending Verification"
            value={pendingLocations.length}
            icon="⏳"
            color="orange"
            subtitle="Awaiting codes"
          />
          <StatsCard
            title="Verified"
            value={verifiedLocations.length}
            icon="✅"
            color="green"
            subtitle="Live on Google"
          />
          <StatsCard
            title="Issues"
            value={issueLocations.length}
            icon="❌"
            color="red"
            subtitle="Need attention"
          />
        </div>
        
        {/* Tabs */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-zinc-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'create' && (
              <CreateLocationTab onLocationCreated={handleLocationCreated} />
            )}
            {activeTab === 'pending' && (
              <PendingVerificationTab 
                locations={pendingLocations}
                onVerificationComplete={handleVerificationComplete}
              />
            )}
            {activeTab === 'verified' && (
              <VerifiedLocationsTab locations={verifiedLocations} />
            )}
            {activeTab === 'issues' && (
              <IssuesTab 
                locations={issueLocations}
                onRetry={(locationId) => {
                  setLocations(locations.map(loc =>
                    loc.id === locationId
                      ? { ...loc, status: 'pending_verification', updated_at: new Date().toISOString() }
                      : loc
                  ))
                  setActiveTab('pending')
                }}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  icon: string
  color: 'blue' | 'orange' | 'green' | 'red'
  subtitle: string
}

function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'border-blue-500/20 hover:border-blue-500/40',
    orange: 'border-orange-500/20 hover:border-orange-500/40',
    green: 'border-green-500/20 hover:border-green-500/40',
    red: 'border-red-500/20 hover:border-red-500/40'
  }
  
  const iconBgClasses = {
    blue: 'bg-blue-500/10',
    orange: 'bg-orange-500/10',
    green: 'bg-green-500/10',
    red: 'bg-red-500/10'
  }
  
  return (
    <div className={`
      bg-zinc-900/50 border ${colorClasses[color]} rounded-xl p-6 
      hover:transform hover:-translate-y-1 transition-all duration-200
    `}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-3xl p-2 rounded-lg ${iconBgClasses[color]}`}>
          {icon}
        </span>
      </div>
      <div className="text-zinc-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{subtitle}</div>
    </div>
  )
}
