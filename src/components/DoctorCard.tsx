import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Star, Clock, AlertTriangle } from 'lucide-react';
import { Doctor } from '@/types/medical';

interface DoctorCardProps {
  doctor: Doctor;
  index: number;
}

export function DoctorCard({ doctor, index }: DoctorCardProps) {
  const handleCall = () => {
    window.open(`tel:${doctor.contactNumber}`, '_self');
  };

  const handleDirections = () => {
    const encodedAddress = encodeURIComponent(doctor.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
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
                <h3 className="font-semibold text-lg text-foreground">{doctor.name}</h3>
                {doctor.isEmergency && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Priority
                  </Badge>
                )}
              </div>
              <p className="text-sm text-primary font-medium mb-1">{doctor.specialization}</p>
              <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
            </div>
            
            {doctor.rating && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">{doctor.rating}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="flex-1">{doctor.address}</span>
              {doctor.distance && (
                <Badge variant="outline" className="text-xs">
                  {doctor.distance} km
                </Badge>
              )}
            </div>
            
            {doctor.experience && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{doctor.experience} experience</span>
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
                <MapPin className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}