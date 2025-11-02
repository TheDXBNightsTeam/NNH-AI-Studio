"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, Grid3x3, List, Map } from "lucide-react"

interface LocationFiltersProps {
  viewMode: "grid" | "list" | "map"
  onViewModeChange: (mode: "grid" | "list" | "map") => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filterRating: string
  onFilterRatingChange: (rating: string) => void
  filterStatus: string
  onFilterStatusChange: (status: string) => void
}

export function LocationFilters({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  filterRating,
  onFilterRatingChange,
  filterStatus,
  onFilterStatusChange,
}: LocationFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("grid")}
            className={
              viewMode === "grid"
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "border-primary/30 text-muted-foreground hover:text-foreground"
            }
            title="Grid View"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            className={
              viewMode === "list"
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "border-primary/30 text-muted-foreground hover:text-foreground"
            }
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("map")}
            className={
              viewMode === "map"
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "border-primary/30 text-muted-foreground hover:text-foreground"
            }
            title="Map View"
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterRating} onValueChange={onFilterRatingChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-primary/30 text-foreground">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/30">
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-primary/30 text-foreground">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/30">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="syncing">Syncing</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="border-primary/30 text-muted-foreground hover:text-foreground bg-transparent"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>
    </div>
  )
}
