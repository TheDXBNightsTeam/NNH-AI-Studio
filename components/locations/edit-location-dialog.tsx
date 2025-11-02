"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, MapPin, Phone, Globe, FileText, Clock, CheckCircle2 } from "lucide-react"
import type { GMBLocation } from "@/lib/types/database"

interface EditLocationDialogProps {
  location: GMBLocation | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditLocationDialog({ location, open, onOpenChange, onSuccess }: EditLocationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    primaryPhone: "",
    websiteUri: "",
    addressLines: [] as string[],
    locality: "",
    administrativeArea: "",
    postalCode: "",
    regionCode: "US",
  })

  // Business hours state
  const [businessHours, setBusinessHours] = useState<any[]>([])

  useEffect(() => {
    if (location && open) {
      const metadata = (location.metadata as any) || {}
      const address = metadata.storefrontAddress || {}
      const phoneNumbers = metadata.phoneNumbers || {}
      const profile = metadata.profile || {}
      const regularHours = metadata.regularHours || {}

      setFormData({
        title: location.location_name || "",
        description: profile.description || "",
        primaryPhone: phoneNumbers.primaryPhone || location.phone || "",
        websiteUri: location.website || "",
        addressLines: address.addressLines || [],
        locality: address.locality || "",
        administrativeArea: address.administrativeArea || "",
        postalCode: address.postalCode || "",
        regionCode: address.regionCode || "US",
      })

      setBusinessHours(regularHours.periods || [])
    }
  }, [location, open])

  const handleSubmit = async () => {
    if (!location) return

    setLoading(true)
    try {
      // Prepare update data based on active tab
      let updateData: any = {}
      let updateMask = ""

      if (activeTab === "basic") {
        updateData = {
          title: formData.title,
          profile: formData.description ? { description: formData.description } : undefined,
          phoneNumbers: formData.primaryPhone ? {
            primaryPhone: formData.primaryPhone,
          } : undefined,
          websiteUri: formData.websiteUri || undefined,
        }
        
        // Build update mask
        const maskParts = ["title"]
        if (formData.description) maskParts.push("profile")
        if (formData.primaryPhone) maskParts.push("phoneNumbers")
        if (formData.websiteUri) maskParts.push("websiteUri")
        updateMask = maskParts.join(",")
      } else if (activeTab === "address") {
        updateData = {
          storefrontAddress: {
            addressLines: formData.addressLines.filter(line => line.trim()),
            locality: formData.locality || undefined,
            administrativeArea: formData.administrativeArea || undefined,
            postalCode: formData.postalCode || undefined,
            regionCode: formData.regionCode,
          },
        }
        updateMask = "storefrontAddress"
      } else if (activeTab === "hours") {
        updateData = {
          regularHours: {
            periods: businessHours,
          },
        }
        updateMask = "regularHours"
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key]
      })

      const response = await fetch(`/api/gmb/location/${location.id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updateMask,
          location: updateData,
          validateOnly: false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update location")
      }

      toast.success("Location updated successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating location:", error)
      toast.error(error.message || "Failed to update location")
    } finally {
      setLoading(false)
    }
  }

  if (!location) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Location</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your business location information
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">
                Business Name *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary border-primary/30 text-foreground"
                placeholder="Your Business Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-secondary border-primary/30 text-foreground min-h-[100px]"
                placeholder="Describe your business..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryPhone" className="text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Primary Phone
              </Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.primaryPhone}
                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                className="bg-secondary border-primary/30 text-foreground"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUri" className="text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="websiteUri"
                type="url"
                value={formData.websiteUri}
                onChange={(e) => setFormData({ ...formData, websiteUri: e.target.value })}
                className="bg-secondary border-primary/30 text-foreground"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="addressLines" className="text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Street Address
              </Label>
              <Textarea
                id="addressLines"
                value={formData.addressLines.join("\n")}
                onChange={(e) => setFormData({
                  ...formData,
                  addressLines: e.target.value.split("\n").filter(line => line.trim()),
                })}
                className="bg-secondary border-primary/30 text-foreground min-h-[80px]"
                placeholder="Street address line 1&#10;Street address line 2 (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Enter each address line on a new line
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locality" className="text-foreground">
                  City
                </Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="bg-secondary border-primary/30 text-foreground"
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="administrativeArea" className="text-foreground">
                  State/Province
                </Label>
                <Input
                  id="administrativeArea"
                  value={formData.administrativeArea}
                  onChange={(e) => setFormData({ ...formData, administrativeArea: e.target.value })}
                  className="bg-secondary border-primary/30 text-foreground"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-foreground">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="bg-secondary border-primary/30 text-foreground"
                  placeholder="12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regionCode" className="text-foreground">
                  Country Code
                </Label>
                <Input
                  id="regionCode"
                  value={formData.regionCode}
                  onChange={(e) => setFormData({ ...formData, regionCode: e.target.value })}
                  className="bg-secondary border-primary/30 text-foreground"
                  placeholder="US"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Business Hours
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Business hours editing will be available in the next update. For now, hours are synced from Google Business Profile.
              </p>
              {businessHours.length > 0 && (
                <div className="space-y-2">
                  {businessHours.map((period: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-secondary border border-primary/20">
                      <p className="text-sm text-foreground">
                        {period.openDay} - {period.closeDay}: {period.openTime?.hours || 0}:{String(period.openTime?.minutes || 0).padStart(2, '0')} - {period.closeTime?.hours || 0}:{String(period.closeTime?.minutes || 0).padStart(2, '0')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-primary/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-primary/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.title}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Update Location
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

