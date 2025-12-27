import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Phone,
  Building2,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Doctor, Hospital, Location } from '@/types/medical';

interface InteractiveMapProps {
  userLocation?: Location;
  doctors: Doctor[];
  hospitals: Hospital[];
  selectedItem?: Doctor | Hospital | null;
  onItemSelect?: (item: Doctor | Hospital | null) => void;
  isLoading?: boolean;
}

interface MapMarker {
  id: string;
  type: 'user' | 'doctor' | 'hospital';
  lat: number;
  lng: number;
  name: string;
  data: Doctor | Hospital | Location;
}

export function InteractiveMap({ 
  userLocation, 
  doctors, 
  hospitals, 
  selectedItem,
  onItemSelect,
  isLoading = false
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [zoomLevel, setZoomLevel] = useState(12);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Create markers from data
  const markers: MapMarker[] = [
    // User location marker
    ...(userLocation ? [{
      id: 'user',
      type: 'user' as const,
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      name: 'Your Location',
      data: userLocation
    }] : []),
    // Doctor markers
    ...doctors.filter(d => d.latitude && d.longitude).map(doctor => ({
      id: `doctor-${doctor.id}`,
      type: 'doctor' as const,
      lat: doctor.latitude!,
      lng: doctor.longitude!,
      name: doctor.name,
      data: doctor
    })),
    // Hospital markers
    ...hospitals.filter(h => h.latitude && h.longitude).map(hospital => ({
      id: `hospital-${hospital.id}`,
      type: 'hospital' as const,
      lat: hospital.latitude!,
      lng: hospital.longitude!,
      name: hospital.name,
      data: hospital
    }))
  ];

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [userLocation]);

  // Calculate bounds to fit all markers
  const calculateBounds = () => {
    if (markers.length === 0) return;
    
    const lats = markers.map(m => m.lat);
    const lngs = markers.map(m => m.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    setMapCenter({ lat: centerLat, lng: centerLng });
    
    // Adjust zoom based on bounds
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff > 0.1) setZoomLevel(10);
    else if (maxDiff > 0.05) setZoomLevel(12);
    else setZoomLevel(14);
  };

  const handleMarkerClick = (marker: MapMarker) => {
    if (marker.type === 'user') return;
    onItemSelect?.(marker.data as Doctor | Hospital);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 8));

  const getMarkerIcon = (type: MapMarker['type']) => {
    switch (type) {
      case 'user':
        return <Navigation className="w-4 h-4 text-blue-600" />;
      case 'doctor':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'hospital':
        return <Building2 className="w-4 h-4 text-red-600" />;
    }
  };

  const getMarkerColor = (type: MapMarker['type']) => {
    switch (type) {
      case 'user':
        return 'bg-blue-500 border-blue-600';
      case 'doctor':
        return 'bg-green-500 border-green-600';
      case 'hospital':
        return 'bg-red-500 border-red-600';
    }
  };

  // Convert lat/lng to pixel coordinates (simplified projection)
  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = mapRef.current?.clientWidth || 600;
    const mapHeight = mapRef.current?.clientHeight || 400;
    
    // Simple mercator-like projection
    const x = ((lng - mapCenter.lng) * Math.cos(mapCenter.lat * Math.PI / 180) * 111320 / Math.pow(2, 18 - zoomLevel)) + mapWidth / 2;
    const y = ((mapCenter.lat - lat) * 111320 / Math.pow(2, 18 - zoomLevel)) + mapHeight / 2;
    
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isFullscreen ? 'fixed inset-4 z-50' : 'relative'}`}
    >
      <Card className={`border-0 shadow-xl bg-card/95 backdrop-blur-sm ${isFullscreen ? 'h-full' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Medical Facilities Map
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={calculateBounds}
              title="Fit all markers"
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef}
              className={`relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-border overflow-hidden ${
                isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96 md:h-[500px]'
              }`}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                  linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%)
                `
              }}
            >
              {/* Grid overlay for map feel */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Markers */}
              {markers.map((marker) => {
                const { x, y } = latLngToPixel(marker.lat, marker.lng);
                const isSelected = selectedItem && (
                  ('id' in selectedItem && selectedItem.id === (marker.data as any).id) ||
                  marker.id === 'user'
                );
                const isHovered = hoveredMarker === marker.id;

                return (
                  <motion.div
                    key={marker.id}
                    className="absolute cursor-pointer"
                    style={{ left: x - 12, top: y - 12 }}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: isSelected ? 1.3 : isHovered ? 1.1 : 1,
                      zIndex: isSelected ? 20 : isHovered ? 15 : 10
                    }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => handleMarkerClick(marker)}
                    onMouseEnter={() => setHoveredMarker(marker.id)}
                    onMouseLeave={() => setHoveredMarker(null)}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg
                      ${getMarkerColor(marker.type)}
                      ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}>
                      {getMarkerIcon(marker.type)}
                    </div>
                    
                    {/* Marker tooltip */}
                    {(isHovered || isSelected) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-2 min-w-32 z-30"
                      >
                        <p className="text-xs font-medium text-foreground truncate">
                          {marker.name}
                        </p>
                        {marker.type !== 'user' && (
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {marker.type === 'doctor' ? 'Doctor' : 'Hospital'}
                            </Badge>
                            {marker.type === 'doctor' && (marker.data as Doctor).isEmergency && (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            )}
                            {marker.type === 'hospital' && (marker.data as Hospital).hasEmergency && (
                              <AlertTriangle className="w-3 h-3 text-destructive" />
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="w-8 h-8 p-0 bg-card/90 backdrop-blur-sm"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="w-8 h-8 p-0 bg-card/90 backdrop-blur-sm"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Center indicator */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-1 bg-foreground/30 rounded-full" 
                />
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}

              {/* No markers message */}
              {!isLoading && markers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Locations Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search radius or location.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center">
                <Navigation className="w-2 h-2 text-white" />
              </div>
              <span className="text-muted-foreground font-medium">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 flex items-center justify-center">
                <Users className="w-2 h-2 text-white" />
              </div>
              <span className="text-muted-foreground font-medium">Doctors ({doctors.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600 flex items-center justify-center">
                <Building2 className="w-2 h-2 text-white" />
              </div>
              <span className="text-muted-foreground font-medium">Hospitals ({hospitals.length})</span>
            </div>
          </div>


        </CardContent>
      </Card>
    </motion.div>
  );
}