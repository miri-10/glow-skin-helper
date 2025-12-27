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
      className="w-full max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Section - Main Location Input */}
        <Card className="border border-white/30 shadow-lg bg-white/20 backdrop-blur-md h-fit w-full">
          <CardHeader className="text-center pb-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <MapPin className="w-8 h-8 text-primary" />
            </motion.div>
            <CardTitle 
              className="text-xl lg:text-2xl font-bold"
              style={{ 
                color: "hsl(220 20% 20%)",
                textShadow: "0 2px 20px rgba(255,255,255,0.5)"
              }}
            >
              Find Nearby Medical Help
            </CardTitle>
            <CardDescription 
              className="text-sm lg:text-base"
              style={{ 
                color: "hsl(220 15% 30%)",
                textShadow: "0 1px 10px rgba(255,255,255,0.8)"
              }}
            >
              We need your location to recommend nearby dermatologists and hospitals
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* GPS Location */}
            <div className="space-y-3">
              <Label 
                className="text-sm font-medium"
                style={{ 
                  color: "hsl(220 20% 20%)",
                  textShadow: "0 1px 10px rgba(255,255,255,0.5)"
                }}
              >
                Use Current Location
              </Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation || isLoading}
                  variant="hero"
                  size="lg"
                  className="w-full h-12"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span 
                  className="bg-white/30 backdrop-blur-sm px-2 font-medium"
                  style={{ 
                    color: "hsl(220 15% 35%)",
                    textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                  }}
                >
                  Or
                </span>
              </div>
            </div>

            {/* Manual City Input */}
            <form onSubmit={handleCitySubmit} className="space-y-3">
              <Label 
                htmlFor="city" 
                className="text-sm font-medium"
                style={{ 
                  color: "hsl(220 20% 20%)",
                  textShadow: "0 1px 10px rgba(255,255,255,0.5)"
                }}
              >
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
                  className="flex-1 h-12"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={!cityInput.trim() || isGeocodingCity || isLoading}
                    variant="outline"
                    size="lg"
                    className="h-12 px-4"
                  >
                    {isGeocodingCity ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Section - Information and Privacy */}
        <div className="space-y-6 w-full">
          {/* Features */}
          <Card className="border border-white/30 shadow-lg bg-white/20 backdrop-blur-md w-full">
            <CardHeader className="pb-4">
              <CardTitle 
                className="text-lg font-semibold"
                style={{ 
                  color: "hsl(220 20% 20%)",
                  textShadow: "0 1px 10px rgba(255,255,255,0.5)"
                }}
              >
                What You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 
                    className="font-medium text-sm"
                    style={{ 
                      color: "hsl(220 20% 20%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.5)"
                    }}
                  >
                    Nearby Doctors
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: "hsl(220 15% 35%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                    }}
                  >
                    Find qualified dermatologists and skin specialists in your area
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 
                    className="font-medium text-sm"
                    style={{ 
                      color: "hsl(220 20% 20%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.5)"
                    }}
                  >
                    Easy Directions
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: "hsl(220 15% 35%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                    }}
                  >
                    Get turn-by-turn directions to medical facilities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 
                    className="font-medium text-sm"
                    style={{ 
                      color: "hsl(220 20% 20%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.5)"
                    }}
                  >
                    Priority Care
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: "hsl(220 15% 35%)",
                      textShadow: "0 1px 5px rgba(255,255,255,0.7)"
                    }}
                  >
                    Emergency facilities highlighted for urgent cases
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs">
                <p 
                  className="font-medium mb-1"
                  style={{ 
                    color: "hsl(220 20% 20%)",
                    textShadow: "0 1px 5px rgba(255,255,255,0.5)"
                  }}
                >
                  Privacy Protected
                </p>
                <p 
                  className="leading-relaxed"
                  style={{ 
                    color: "hsl(220 15% 30%)",
                    textShadow: "0 1px 5px rgba(255,255,255,0.8)"
                  }}
                >
                  Your location is only used to find nearby medical facilities and is not stored or shared. 
                  We respect your privacy and follow strict data protection guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}