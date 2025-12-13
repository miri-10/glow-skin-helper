import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Search, AlertCircle } from 'lucide-react';
import { Location } from '@/types/medical';
import { LocationService } from '@/utils/locationService';
import { toast } from '@/hooks/use-toast';

interface LocationPermissionProps {
  onLocationSet: (location: Location) => void;
  isLoading?: boolean;
}

export function LocationPermission({ onLocationSet, isLoading }: LocationPermissionProps) {
  const [cityInput, setCityInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGeocodingCity, setIsGeocodingCity] = useState(false);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await LocationService.getCurrentLocation();
      onLocationSet(location);
      toast({
        title: "Location accessed",
        description: "Using your current location to find nearby medical facilities.",
      });
    } catch (error) {
      toast({
        title: "Location access failed",
        description: error instanceof Error ? error.message : "Please try entering your city manually.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setIsGeocodingCity(true);
    try {
      const location = await LocationService.geocodeCity(cityInput);
      onLocationSet(location);
      toast({
        title: "City found",
        description: `Using ${location.city} to find nearby medical facilities.`,
      });
    } catch (error) {
      toast({
        title: "City not found",
        description: error instanceof Error ? error.message : "Please try a different city name.",
        variant: "destructive",
      });
    } finally {
      setIsGeocodingCity(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <MapPin className="w-8 h-8 text-primary" />
          </motion.div>
          <CardTitle className="text-xl font-bold">Find Nearby Medical Help</CardTitle>
          <CardDescription>
            We need your location to recommend nearby dermatologists and hospitals
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* GPS Location */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Use Current Location</Label>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation || isLoading}
                variant="outline"
                className="w-full"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 mr-2" />
                    Use GPS Location
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Manual City Input */}
          <form onSubmit={handleCitySubmit} className="space-y-3">
            <Label htmlFor="city" className="text-sm font-medium">
              Enter Your City
            </Label>
            <div className="flex gap-2">
              <Input
                id="city"
                type="text"
                placeholder="e.g., New York, London, Mumbai"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                disabled={isGeocodingCity || isLoading}
                className="flex-1"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={!cityInput.trim() || isGeocodingCity || isLoading}
                  variant="hero"
                >
                  {isGeocodingCity ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </form>

          {/* Privacy Notice */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-secondary/50 rounded-lg p-3 border border-border"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Privacy Protected</p>
                <p>Your location is only used to find nearby medical facilities and is not stored or shared.</p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}