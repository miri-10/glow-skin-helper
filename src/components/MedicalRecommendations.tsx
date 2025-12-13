import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Users, 
  Building2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Filter,
  Info
} from 'lucide-react';
import { Location, MedicalRecommendations as MedicalRecommendationsType, RiskLevel } from '@/types/medical';
import { MedicalDataService } from '@/utils/medicalDataService';
import { LocationPermission } from './LocationPermission';
import { DoctorCard } from './DoctorCard';
import { HospitalCard } from './HospitalCard';

interface MedicalRecommendationsProps {
  prediction: string;
  confidence: number;
}

export function MedicalRecommendations({ prediction, confidence }: MedicalRecommendationsProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [recommendations, setRecommendations] = useState<MedicalRecommendationsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(25);
  
  const riskLevel: RiskLevel = MedicalDataService.getRiskLevel(prediction, confidence);

  const handleLocationSet = async (location: Location) => {
    setUserLocation(location);
    await loadRecommendations(location);
  };

  const loadRecommendations = async (location: Location) => {
    setIsLoading(true);
    try {
      const data = await MedicalDataService.getMedicalRecommendations(
        location,
        riskLevel,
        searchRadius
      );
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userLocation) {
      loadRecommendations(userLocation);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    if (userLocation) {
      loadRecommendations(userLocation);
    }
  };

  if (!userLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <LocationPermission onLocationSet={handleLocationSet} isLoading={isLoading} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6"
    >
      {/* Risk Level Header */}
      <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className={`w-5 h-5 ${MedicalDataService.getRiskLevelColor(riskLevel)}`} />
            <CardTitle className="text-xl">Medical Recommendations</CardTitle>
          </div>
          <CardDescription>
            <span className={`font-medium ${MedicalDataService.getRiskLevelColor(riskLevel)}`}>
              {MedicalDataService.getRiskLevelMessage(riskLevel)}
            </span>
          </CardDescription>
          
          {userLocation.city && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
              <MapPin className="w-4 h-4" />
              <span>Showing results near {userLocation.city}</span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Radius:</span>
          <div className="flex gap-1">
            {[10, 25, 50].map((radius) => (
              <Button
                key={radius}
                variant={searchRadius === radius ? "default" : "outline"}
                size="sm"
                onClick={() => handleRadiusChange(radius)}
                disabled={isLoading}
              >
                {radius}km
              </Button>
            ))}
          </div>
        </div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Finding nearby medical facilities...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      {recommendations && !isLoading && (
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Doctors ({recommendations.doctors.length})
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Hospitals ({recommendations.hospitals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-6">
            {recommendations.doctors.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.doctors.map((doctor, index) => (
                  <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Doctors Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try increasing the search radius or check a different location.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hospitals" className="mt-6">
            {recommendations.hospitals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.hospitals.map((hospital, index) => (
                  <HospitalCard key={hospital.id} hospital={hospital} index={index} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Hospitals Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try increasing the search radius or check a different location.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Disclaimer */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-warning/5 border border-warning/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">Important Disclaimer</p>
            <p className="text-muted-foreground">
              Doctor and hospital recommendations are based on publicly available data and location proximity. 
              Always verify details independently. This tool provides informational suggestions only and does not 
              guarantee availability, quality of care, or medical outcomes.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}