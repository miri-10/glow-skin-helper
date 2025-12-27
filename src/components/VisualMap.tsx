import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Users,
  Building2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Doctor, Hospital, Location } from '@/types/medical';

interface VisualMapProps {
  userLocation: Location;
  doctors: Doctor[];
  hospitals: Hospital[];
  onOpenGoogleMaps: () => void;
  className?: string;
}

export function VisualMap({ 
  userLocation, 
  doctors, 
  hospitals, 
  onOpenGoogleMaps,
  className = "" 
}: VisualMapProps) {
  const allItems = [
    ...doctors.map(d => ({ ...d, type: 'doctor' as const })),
    ...hospitals.map(h => ({ ...h, type: 'hospital' as const }))
  ].sort((a, b) => (a.distance || 0) - (b.distance || 0));

  // Create a visual representation of locations
  const getItemPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 120;
    const centerX = 200;
    const centerY = 150;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-lg border-2 border-border overflow-hidden bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 ${className}`}
    >
      {/* Visual Map Container */}
      <div className="relative h-96 p-4">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 300"
          className="absolute inset-0"
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* User location (center) */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <circle cx="200" cy="150" r="8" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
            <circle cx="200" cy="150" r="20" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite" />
            </circle>
          </motion.g>
          
          {/* Location markers */}
          {allItems.slice(0, 8).map((item, index) => {
            const pos = getItemPosition(index, Math.min(allItems.length, 8));
            const isDoctor = item.type === 'doctor';
            const isEmergency = (isDoctor && (item as Doctor).isEmergency) || 
                              (!isDoctor && (item as Hospital).hasEmergency);
            
            return (
              <motion.g
                key={`${item.type}-${item.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {/* Connection line */}
                <line
                  x1="200"
                  y1="150"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#9ca3af"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                
                {/* Marker */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="6"
                  fill={isDoctor ? "#10b981" : "#ef4444"}
                  stroke={isEmergency ? "#f59e0b" : "white"}
                  strokeWidth={isEmergency ? "3" : "2"}
                />
                
                {/* Distance label */}
                <text
                  x={pos.x}
                  y={pos.y - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                  fontWeight="500"
                >
                  {item.distance ? `${item.distance}km` : ''}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            You are here
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenGoogleMaps}
            className="bg-white/95 hover:bg-white shadow-lg backdrop-blur-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Map
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Doctors</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Hospitals</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Emergency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium">{doctors.length}</span>
              <span className="text-muted-foreground">Doctors</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-red-600" />
              <span className="font-medium">{hospitals.length}</span>
              <span className="text-muted-foreground">Hospitals</span>
            </div>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={onOpenGoogleMaps}
            className="text-xs"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Navigate
          </Button>
        </div>
        
        {userLocation.city && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing medical facilities near {userLocation.city}
          </p>
        )}
      </div>
    </motion.div>
  );
}