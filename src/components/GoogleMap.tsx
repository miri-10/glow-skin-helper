import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Maximize2, 
  Phone,
  Building2,
  Users,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Doctor, Hospital, Location } from '@/types/medical';

interface GoogleMapProps {
  userLocation?: Location;
  doctors: Doctor[];
  hospitals: Hospital[];
  selectedItem?: Doctor | Hospital | null;
  onItemSelect?: (item: Doctor | Hospital | null) => void;
  isLoading?: boolean;
}

export function GoogleMap({ 
  userLocation, 
  doctors, 
  hospitals, 
  selectedItem,
  onItemSelect,
  isLoading = false
}: GoogleMapProps) {
  const mapRef = useRef<HTMLIFrameElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Create embedded Google Maps URL
  const createGoogleMapsEmbedUrl = () => {
    const baseUrl = 'https://www.google.com/maps/embed/v1/view';
    
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      return `${baseUrl}?key=YOUR_API_KEY&center=${latitude},${longitude}&zoom=13&maptype=roadmap`;
    }
    
    // Default to a general location if no user location
    return `${baseUrl}?key=YOUR_API_KEY&center=40.7128,-74.0060&zoom=11&maptype=roadmap`;
  };

  // Create Google Maps search URL with multiple locations
  const createGoogleMapsSearchUrl = () => {
    const center = userLocation 
      ? `${userLocation.latitude},${userLocation.longitude}`
      : '40.7128,-74.0060';
    
    // Create a search for medical facilities near the location
    const searchTerms = [];
    if (doctors.length > 0) searchTerms.push('dermatologist');
    if (hospitals.length > 0) searchTerms.push('hospital');
    
    if (searchTerms.length > 0) {
      return `https://www.google.com/maps/search/${searchTerms.join('+OR+')}/@${center},13z`;
    }
    
    return `https://www.google.com/maps/@${center},13z`;
  };

  // Create OpenStreetMap embed URL
  const createOpenStreetMapUrl = () => {
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      const bbox = `${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
    }
    
    // Default to NYC area
    return `https://www.openstreetmap.org/export/embed.html?bbox=-74.0260,-73.9860,40.7028,40.7228&layer=mapnik`;
  };

  const handleOpenInGoogleMaps = () => {
    window.open(createGoogleMapsSearchUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleDirectionsToItem = (item: Doctor | Hospital) => {
    const destination = item.latitude && item.longitude 
      ? `${item.latitude},${item.longitude}`
      : encodeURIComponent(item.address);
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Medical Facilities Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInGoogleMaps}
              title="Open in Google Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Map Container */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-border overflow-hidden h-96 md:h-[500px]">
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading map...</p>
                  </div>
                </div>
              )}

              {/* Interactive Map using Google Maps Embed */}
              <iframe
                ref={mapRef}
                src={createOpenStreetMapUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
                onLoad={() => setIsMapLoaded(true)}
                onError={() => setMapError('Failed to load map')}
              />

              {/* Fallback content */}
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                  <div className="text-center p-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Map Unavailable</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unable to load the interactive map.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenInGoogleMaps}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>
              )}

              {/* No markers message */}
              {!isLoading && doctors.length === 0 && hospitals.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
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

          {/* Location List */}
          {(doctors.length > 0 || hospitals.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Nearby Locations</h4>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {/* Doctors */}
                {doctors.slice(0, 3).map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedItem?.id === doctor.id 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                    onClick={() => onItemSelect?.(doctor)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-600 flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                        {doctor.distance && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {doctor.distance} km
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doctor.isEmergency && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectionsToItem(doctor);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Hospitals */}
                {hospitals.slice(0, 3).map((hospital, index) => (
                  <motion.div
                    key={hospital.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (doctors.length + index) * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      selectedItem?.id === hospital.id 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                    onClick={() => onItemSelect?.(hospital)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-600 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{hospital.name}</p>
                        <p className="text-xs text-muted-foreground">{hospital.type.replace('_', ' ')}</p>
                        {hospital.distance && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {hospital.distance} km
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hospital.hasEmergency && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectionsToItem(hospital);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Show more button if there are more items */}
                {(doctors.length > 3 || hospitals.length > 3) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInGoogleMaps}
                    className="w-full"
                  >
                    View All {doctors.length + hospitals.length} Locations in Google Maps
                  </Button>
                )}
              </div>
            </div>
          )}

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