// src/components/locations/LocationMapDashboard.tsx

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // يجب أن يكون لديك هذا المكون
import { Filter, Search, Globe, Pin, RefreshCw, Loader2, Star, Send, Layers } from 'lucide-react';
import { cn } from '@/lib/utils'; 
import { toast } from 'sonner'; // لرسائل التنبيه

// تعريف نوع بيانات الموقع (يجب أن يتطابق مع ما يرجعه API)
interface LocationData {
    id: string;
    name: string;
    lat: number;
    lng: number;
    rating: number;
    status: 'Verified' | 'Suspended' | 'Needs Attention';
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 25.2048, 
  lng: 55.2708,
};

// ⭐️ التعديل هنا: تم حذف 'localContext' غير الصالحة
const libraries: ("places" | "drawing" | "geometry" | "visualization" | "marker")[] = ['places'];


export function LocationMapDashboard() {
  const [locationsData, setLocationsData] = useState<LocationData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMarker, setSelectedMarker] = useState<LocationData | null>(null);

  // ⭐️ حالة جديدة لتعقب المواقع المحددة للإجراءات الجماعية
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);


  // 1. تحميل سكربت الخريطة
  const { isLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries,
  });

  // 2. دالة جلب البيانات من API Route
  const fetchMapData = useCallback(async () => {
    setLoadingData(true);
    setErrorData(null);
    try {
      const response = await fetch('/api/locations/map-data');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch location data');
      }

      setLocationsData(data);
      // بعد جلب البيانات، يتم إزالة تحديد الكل لضمان التناسق
      setSelectedLocations([]); 
      setLoadingData(false);
    } catch (e: any) {
      console.error(e);
      setErrorData(e.message || 'Error fetching map data');
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // 3. تطبيق منطق التصفية والبحث
  const filteredLocations = useMemo(() => {
    return locationsData.filter(loc => {
      const statusMatch = selectedStatus === 'all' || loc.status === selectedStatus;
      const searchMatch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [selectedStatus, searchTerm, locationsData]);

  // ⭐️ دالة تبديل التحديد للمواقع
  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations(prev => 
        prev.includes(locationId) 
            ? prev.filter(id => id !== locationId) 
            : [...prev, locationId]
    );
  };

  // ⭐️ دالة تحديد / إلغاء تحديد الكل للمواقع المُفلترة
  const toggleSelectAll = () => {
    const allFilteredIds = filteredLocations.map(loc => loc.id);
    const areAllSelected = allFilteredIds.every(id => selectedLocations.includes(id));

    if (areAllSelected) {
        // إلغاء تحديد الكل
        setSelectedLocations(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
        // تحديد الكل (مع دمج المواقع التي لم يتم فلترتها إذا كانت محددة بالفعل)
        const currentSelectionMinusFiltered = selectedLocations.filter(id => !allFilteredIds.includes(id));
        setSelectedLocations([...currentSelectionMinusFiltered, ...allFilteredIds]);
    }
  };

  // ⭐️ دالة تنفيذ النشر الجماعي (كمثال)
  const handleBulkPublish = async () => {
    if (selectedLocations.length === 0) {
        toast.error("Please select at least one location.");
        return;
    }

    // 💡 افتراض: هنا يجب أن تظهر نافذة منبثقة لاختيار المنشور
    const postIdToPublish = prompt("Enter the ID of the post you want to publish to all selected locations:");
    if (!postIdToPublish) return;

    setIsBulkProcessing(true);
    try {
        const response = await fetch('/api/locations/bulk-publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                locationIds: selectedLocations, 
                postId: postIdToPublish 
            }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || `Failed to publish to ${selectedLocations.length} locations.`);
        }

        toast.success(`Post published successfully to ${selectedLocations.length} locations!`);
        setSelectedLocations([]); // مسح التحديد بعد الانتهاء

    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setIsBulkProcessing(false);
    }
  };


  const getMarkerIcon = (status: LocationData['status']) => {
      switch (status) {
          case 'Suspended':
              return { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }; 
          case 'Needs Attention':
              return { url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png' }; 
          case 'Verified':
          default:
              return { url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }; 
      }
  };


  const renderMap = () => (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={locationsData.length > 0 ? 11 : 4} 
      center={locationsData.length > 0 ? { lat: locationsData[0].lat, lng: locationsData[0].lng } : defaultCenter}
      options={{ disableDefaultUI: true, zoomControl: true }}
      onClick={() => setSelectedMarker(null)} 
    >
        {/* عرض نقاط المواقع الحقيقية */}
        {filteredLocations.map((loc) => (
            <Marker 
                key={loc.id} 
                position={{ lat: loc.lat, lng: loc.lng }} 
                title={loc.name}
                icon={getMarkerIcon(loc.status)}
                onClick={() => setSelectedMarker(loc)}
            />
        ))}

        {/* نافذة المعلومات عند النقر على النقطة */}
        {selectedMarker && (
            <InfoWindow 
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
            >
                <div className="p-2">
                    <h4 className="font-bold text-sm">{selectedMarker.name}</h4>
                    <p className="text-xs flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 
                        Rating: {selectedMarker.rating.toFixed(1) || 'N/A'}
                    </p>
                    <p className={cn("text-xs mt-1", 
                         selectedMarker.status === 'Suspended' ? 'text-red-500' : 
                         selectedMarker.status === 'Needs Attention' ? 'text-yellow-600' : 
                         'text-green-600')}>
                        Status: {selectedMarker.status}
                    </p>
                    <Button variant="link" size="sm" className="h-6 p-0 mt-2">View Details</Button>
                </div>
            </InfoWindow>
        )}
    </GoogleMap>
  );

  if (mapLoadError) return <div className="p-8 text-center text-red-500">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="p-8 text-center text-muted-foreground">Loading Map...</div>;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ⭐️ الجزء الأيسر: عناصر التحكم والفلاتر والإجراءات الجماعية */}
      <Card className="lg:col-span-1 border border-primary/20">
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="w-5 h-5"/> Location Actions & View</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchMapData} disabled={loadingData}>
            <RefreshCw className={cn("w-4 h-4", loadingData && "animate-spin")} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* شريط الإجراءات الجماعية (يظهر عند التحديد) */}
          {selectedLocations.length > 0 && (
            <Card className="p-3 border-2 border-primary/50 bg-primary/10 transition-all">
                <p className="text-sm font-semibold mb-2">{selectedLocations.length} Locations Selected</p>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        size="sm" 
                        className="gap-1" 
                        onClick={handleBulkPublish}
                        disabled={isBulkProcessing}
                    >
                        {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Bulk Publish Post
                    </Button>
                    {/* يمكنك إضافة المزيد من الإجراءات الجماعية هنا */}
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setSelectedLocations([])}
                        disabled={isBulkProcessing}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
          )}

          {/* شريط البحث */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1"><Search className="w-4 h-4"/> Search Location</label>
            <Input 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loadingData}
            />
          </div>

          {/* فلتر الحالة */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1"><Pin className="w-4 h-4"/> Location Status</label>
            <Select onValueChange={setSelectedStatus} value={selectedStatus} disabled={loadingData}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations ({locationsData.length})</SelectItem>
                <SelectItem value="Verified">✅ Verified</SelectItem>
                <SelectItem value="Needs Attention">⚠️ Needs Attention</SelectItem>
                <SelectItem value="Suspended">❌ Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* زر عرض طبقة المنافسة (للتنفيذ لاحقاً) */}
          <Button variant="outline" className="w-full gap-2 mt-4" disabled>
            <Globe className="w-4 h-4" /> Show Competitor Overlay (Soon)
          </Button>

          {/* قائمة المواقع الناتجة */}
          <div className="pt-4">
            <h3 className="text-md font-semibold mb-3">Filtered Results ({filteredLocations.length})</h3>

            {/* ⭐️ زر تحديد/إلغاء تحديد الكل */}
            {filteredLocations.length > 0 && (
                <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                        id="selectAll"
                        checked={filteredLocations.every(loc => selectedLocations.includes(loc.id))}
                        onCheckedChange={toggleSelectAll}
                    />
                    <label
                        htmlFor="selectAll"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Select All ({filteredLocations.length})
                    </label>
                </div>
            )}

            {loadingData ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading locations...</div>
            ) : errorData ? (
                <div className="text-sm text-red-500">Error: {errorData}</div>
            ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredLocations.length === 0 ? (
                         <div className="text-sm text-muted-foreground">No locations match your filters.</div>
                    ) : (
                        filteredLocations.map(loc => (
                            <div 
                                key={loc.id} 
                                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    {/* ⭐️ Checkbox لتحديد الموقع */}
                                    <Checkbox 
                                        checked={selectedLocations.includes(loc.id)} 
                                        onCheckedChange={() => toggleLocationSelection(loc.id)}
                                        onClick={(e) => e.stopPropagation()} // منع نقر العنصر الأب من إغلاق نافذة المعلومات
                                    />
                                    <div onClick={() => setSelectedMarker(loc)}>
                                        <p className="font-medium text-sm">{loc.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            {loc.rating.toFixed(1) || 'N/A'} ({loc.status})
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMarker(loc)}>View</Button>
                            </div>
                        ))
                    )}
                </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* ⭐️ الجزء الأيمن: الخريطة التفاعلية */}
      <div className="lg:col-span-2">
        <Card className="border border-primary/20 p-0 overflow-hidden">
          {renderMap()}
        </Card>
      </div>

    </div>
  );
}