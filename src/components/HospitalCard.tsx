import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Star, Building2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Hospital } from '@/types/medical';

interface HospitalCardProps {
  hospital: Hospital;
  index: number;
}

export function HospitalCard({ hospital, index }: HospitalCardProps) {
  const handleCall = () => {
    window.open(`tel:${hospital.contactNumber}`, '_self');
  };

  const handleDirections = () => {
    if (hospital.googleMapsUrl) {
      window.open(hospital.googleMapsUrl, '_blank');
    }
  };

  const getTypeLabel = (type: Hospital['type']) => {
    switch (type) {
      case 'hospital':
        return 'Hospital';
      case 'clinic':
        return 'Clinic';
      case 'specialty_center':
        return 'Specialty Center';
    }
  };

  const getTypeColor = (type: Hospital['type']) => {
    switch (type) {
      case 'hospital':
        return 'bg-blue-100 text-blue-800';
      case 'clinic':
        return 'bg-green-100 text-green-800';
      case 'specialty_center':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-foreground">{hospital.name}</h3>
                {hospital.hasEmergency && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-xs ${getTypeColor(hospital.type)}`}>
                  <Building2 className="w-3 h-3 mr-1" />
                  {getTypeLabel(hospital.type)}
                </Badge>
                {hospital.distance && (
                  <Badge variant="outline" className="text-xs">
                    {hospital.distance} km
                  </Badge>
                )}
              </div>
            </div>
            
            {hospital.rating && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">{hospital.rating}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{hospital.address}</span>
            </div>
            
            {hospital.specialties && hospital.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {hospital.specialties.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{hospital.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Button
                onClick={handleCall}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Button
                onClick={handleDirections}
                variant="hero"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}