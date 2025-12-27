import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Phone,
  Building2,
  Users,
  AlertTriangle,
  ExternalLink,
  Map
} from 'lucide-react';
import { Doctor, Hospital, Location } from '@/types/medical';
import { EmbeddedMap } from './EmbeddedMap';

interface MapViewProps {
  userLocation?: Location;
  doctors: Doctor[];
  hospitals: Hospital[];
  selectedItem?: Doctor | Hospital | null;
  onItemSelect?: (item: Doctor | Hospital | null) => void;
  isLoading?: boolean;
}

export function MapView({ 
  userLocation, 
  doctors, 
  hospitals, 
  selectedItem,
  onItemSelect,
  isLoading = false
}: MapViewProps) {

  const handleOpenInGoogleMaps = () => {
    const center = userLocation 
      ? `${userLocation.latitude},${userLocation.longitude}`
      : '40.7128,-74.0060';
    
    // Create a search for medical facilities near the location
    const searchTerms = [];
    if (doctors.length > 0) searchTerms.push('dermatologist');
    if (hospitals.length > 0) searchTerms.push('hospital');
    
    const url = searchTerms.length > 0
      ? `https://www.google.com/maps/search/${searchTerms.join('+OR+')}/@${center},13z`
      : `https://www.google.com/maps/@${center},13z`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDirectionsToItem = (item: Doctor | Hospital) => {
    const destination = item.latitude && item.longitude 
      ? `${item.latitude},${item.longitude}`
      : encodeURIComponent(item.address);
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCallItem = (item: Doctor | Hospital) => {
    window.open(`tel:${item.contactNumber}`, '_self');
  };

  const allItems = [
    ...doctors.map(d => ({ ...d, type: 'doctor' as const })),
    ...hospitals.map(h => ({ ...h, type: 'hospital' as const }))
  ].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Map Header */}
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Medical Facilities Near You
          </CardTitle>
          <Button
            variant="hero"
            size="sm"
            onClick={handleOpenInGoogleMaps}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </Button>
        </CardHeader>

        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{doctors.length}</div>
              <div className="text-sm text-muted-foreground">Doctors</div>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{hospitals.length}</div>
              <div className="text-sm text-muted-foreground">Hospitals</div>
            </div>
          </div>

          {/* Interactive Google Map */}
          {userLocation ? (
            <EmbeddedMap
              userLocation={userLocation}
              doctors={doctors}
              hospitals={hospitals}
              className="mb-6"
            />
          ) : (
            <div className="relative rounded-lg border-2 border-border overflow-hidden h-96 mb-6">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">Interactive Map</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Location needed to display map with nearby medical facilities
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleOpenInGoogleMaps}
                    className="flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Open Google Maps
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location List */}
      {allItems.length > 0 && (
        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Nearby Medical Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allItems.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    selectedItem?.id === item.id 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card border-border hover:border-primary/20'
                  }`}
                  onClick={() => onItemSelect?.(item)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      item.type === 'doctor' 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-red-500 border-red-600'
                    }`}>
                      {item.type === 'doctor' ? (
                        <Users className="w-5 h-5 text-white" />
                      ) : (
                        <Building2 className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        {((item.type === 'doctor' && (item as Doctor).isEmergency) || 
                          (item.type === 'hospital' && (item as Hospital).hasEmergency)) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Priority
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-primary font-medium mb-1">
                        {item.type === 'doctor' 
                          ? (item as Doctor).specialization 
                          : (item as Hospital).type.replace('_', ' ')
                        }
                      </p>
                      
                      <p className="text-sm text-muted-foreground mb-2">{item.address}</p>
                      
                      <div className="flex items-center gap-2">
                        {item.distance && (
                          <Badge variant="outline" className="text-xs">
                            {item.distance} km away
                          </Badge>
                        )}
                        {item.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {item.rating}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallItem(item);
                      }}
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectionsToItem(item);
                      }}
                      title="Get Directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {!isLoading && allItems.length === 0 && (
        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Medical Facilities Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search radius or location to find nearby medical facilities.
            </p>
            <Button
              variant="outline"
              onClick={handleOpenInGoogleMaps}
            >
              <Map className="w-4 h-4 mr-2" />
              Search on Google Maps
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}