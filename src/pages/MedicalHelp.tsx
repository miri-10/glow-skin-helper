import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MapPin, 
  Users, 
  Building2, 
  Phone, 
  AlertTriangle,
  Info,
  Shield,
  Clock
} from 'lucide-react';
import { LocationPermission } from '@/components/LocationPermission';
import { MedicalRecommendations } from '@/components/MedicalRecommendations';
import { Location } from '@/types/medical';

export default function MedicalHelp() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleLocationSet = (location: Location) => {
    setUserLocation(location);
  };

  const riskLevels = [
    {
      level: 'low' as const,
      label: 'Routine Check-up',
      description: 'General skin health monitoring',
      color: 'bg-success/10 text-success border-success/30',
      confidence: 85,
    },
    {
      level: 'medium' as const,
      label: 'Moderate Concern',
      description: 'Uncertain findings requiring evaluation',
      color: 'bg-warning/10 text-warning border-warning/30',
      confidence: 65,
    },
    {
      level: 'high' as const,
      label: 'High Priority',
      description: 'Immediate medical attention needed',
      color: 'bg-destructive/10 text-destructive border-destructive/30',
      confidence: 75,
    },
  ];

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6"
          >
            <Heart className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Medical Help
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with nearby dermatologists and medical facilities for professional skin health care.
          </p>
        </motion.div>

        {!userLocation ? (
          <div className="space-y-8">
            {/* Features Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: Users,
                  title: 'Expert Dermatologists',
                  description: 'Find qualified skin specialists in your area',
                },
                {
                  icon: Building2,
                  title: 'Medical Facilities',
                  description: 'Locate hospitals and clinics with dermatology services',
                },
                {
                  icon: MapPin,
                  title: 'Location-Based',
                  description: 'Get recommendations based on your proximity',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/95 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Risk Level Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-card/95 backdrop-blur-sm mb-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Select Your Priority Level</CardTitle>
                  <CardDescription>
                    Choose the urgency level to get appropriate recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {riskLevels.map((risk) => (
                      <motion.div
                        key={risk.level}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedRiskLevel === risk.level ? "default" : "outline"}
                          className={`w-full h-auto p-4 flex flex-col items-center gap-2 ${
                            selectedRiskLevel === risk.level ? '' : 'hover:bg-secondary/50'
                          }`}
                          onClick={() => setSelectedRiskLevel(risk.level)}
                        >
                          <div className="flex items-center gap-2">
                            {risk.level === 'high' && <AlertTriangle className="w-4 h-4" />}
                            {risk.level === 'medium' && <Clock className="w-4 h-4" />}
                            {risk.level === 'low' && <Shield className="w-4 h-4" />}
                            <span className="font-medium">{risk.label}</span>
                          </div>
                          <span className="text-xs opacity-75">{risk.description}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Permission */}
            <LocationPermission onLocationSet={handleLocationSet} />

            {/* Emergency Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="bg-destructive/5 border border-destructive/20 rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Emergency Situations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you notice rapid changes in a mole or lesion, bleeding, or severe symptoms, 
                    seek immediate medical attention.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="destructive" className="text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Emergency: 911
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Poison Control: 1-800-222-1222
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <MedicalRecommendations 
            prediction={selectedRiskLevel === 'high' ? 'malignant' : selectedRiskLevel === 'medium' ? 'uncertain' : 'benign'}
            confidence={riskLevels.find(r => r.level === selectedRiskLevel)?.confidence || 65}
          />
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="mt-12 bg-warning/5 border border-warning/20 rounded-xl p-4 text-center"
        >
          <div className="flex items-start justify-center gap-3">
            <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Medical Disclaimer</p>
              <p className="text-muted-foreground">
                This service provides informational recommendations only. Always consult qualified healthcare 
                professionals for medical advice, diagnosis, and treatment. Verify all contact information 
                and availability before visiting any medical facility.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}