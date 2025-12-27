import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  ExternalLink,
  Users,
  Building2,
  AlertTriangle,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { Doctor, Hospital, Location } from '@/types/medical';
import { VisualMap } from './VisualMap';

interface EmbeddedMapProps {
  userLocation: Location;
  doctors: Doctor[];
  hospitals: Hospital[];
  className?: string;
}

export function EmbeddedMap({ userLocation, doctors, hospitals, className = "" }: EmbeddedMapProps) {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [mapError, setMapError] = useState<boolean>(false);

  useEffect(() => {
    if (!userLocation) return;

    // Create search query based on available facilities
    const searchQuery = doctors.length > 0 && hospitals.length > 0 
      ? `dermatologist+hospital near ${userLocation.latitude},${userLocation.longitude}`
      : doctors.length > 0 
      ? `dermatologist near ${userLocation.latitude},${userLocation.longitude}`
      : hospitals.length > 0 
      ? `hospital near ${userLocation.latitude},${userLocation.longitude}`
      : `medical facilities near ${userLocation.latitude},${userLocation.longitude}`;

    // Use Google Maps embed URL
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    
    setMapUrl(embedUrl);
    setMapError(false);
  }, [userLocation, doctors, hospitals]);

  const handleMapError = () => {
    setMapError(true);
  };

  const handleRetryMap = () => {
    setMapError(false);
    // Trigger re-render of the map
    const timestamp = Date.now();
    setMapUrl(prev => prev + `&t=${timestamp}`);
  };

  const handleOpenInGoogleMaps = () => {
    const center = `${userLocation.latitude},${userLocation.longitude}`;
    const searchTerms = [];
    if (doctors.length > 0) searchTerms.push('dermatologist');
    if (hospitals.length > 0) searchTerms.push('hospital');
    
    const url = searchTerms.length > 0
      ? `https://www.google.com/maps/search/${searchTerms.join('+OR+')}/@${center},13z`
      : `https://www.google.com/maps/@${center},13z`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const allItems = [
    ...doctors.map(d => ({ ...d, type: 'doctor' as const })),
    ...hospitals.map(h => ({ ...h, type: 'hospital' as const }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-lg border-2 border-border overflow-hidden bg-white ${className}`}
    >
      {/* Map Container */}
      <div className="relative h-96">
        {!mapError ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
            title="Medical Facilities Map"
            onError={handleMapError}
          />
        ) : (
          <VisualMap
            userLocation={userLocation}
            doctors={doctors}
            hospitals={hospitals}
            onOpenGoogleMaps={handleOpenInGoogleMaps}
            className="absolute inset-0"
          />
        )}

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenInGoogleMaps}
            className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm"
            title="Open in Google Maps"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Location indicator */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-blue-500/95 text-white px-3 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm">
            <Navigation className="w-4 h-4" />
            <span className="font-medium">Your Location</span>
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">{doctors.length} Doctors</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-muted-foreground">{hospitals.length} Hospitals</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInGoogleMaps}
                className="text-xs h-auto p-1"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Full Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {allItems.length > 0 && (
        <div className="p-4 bg-secondary/30 border-t">
          <h4 className="font-medium text-foreground mb-3 text-sm">Map Legend</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {doctors.slice(0, 3).map((doctor, index) => (
              <div key={doctor.id} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-muted-foreground truncate">{doctor.name}</span>
                {doctor.isEmergency && (
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                )}
              </div>
            ))}
            {hospitals.slice(0, 3).map((hospital, index) => (
              <div key={hospital.id} className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + doctors.length + index)}
                </div>
                <span className="text-muted-foreground truncate">{hospital.name}</span>
                {hospital.hasEmergency && (
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                )}
              </div>
            ))}
            {allItems.length > 6 && (
              <div className="text-muted-foreground text-xs">
                +{allItems.length - 6} more locations
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}