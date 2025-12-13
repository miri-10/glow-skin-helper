import { Doctor, Hospital, Location, MedicalRecommendations, RiskLevel } from '@/types/medical';
import { LocationService } from './locationService';

export class MedicalDataService {
  // Mock data - In production, this would come from APIs like Google Places
  private static mockDoctors: Omit<Doctor, 'distance'>[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Dermatologist & Skin Cancer Specialist',
      hospital: 'City Medical Center',
      contactNumber: '+1 (555) 123-4567',
      address: '123 Medical Plaza, Downtown',
      rating: 4.8,
      experience: '15+ years',
      isEmergency: true,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Dermatologist',
      hospital: 'Skin Health Clinic',
      contactNumber: '+1 (555) 234-5678',
      address: '456 Health Street, Midtown',
      rating: 4.6,
      experience: '12+ years',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Oncological Dermatologist',
      hospital: 'Cancer Treatment Center',
      contactNumber: '+1 (555) 345-6789',
      address: '789 Oncology Drive, Medical District',
      rating: 4.9,
      experience: '20+ years',
      isEmergency: true,
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialization: 'General Dermatologist',
      hospital: 'Community Health Center',
      contactNumber: '+1 (555) 456-7890',
      address: '321 Community Blvd, Suburbs',
      rating: 4.4,
      experience: '8+ years',
    },
    {
      id: '5',
      name: 'Dr. Lisa Thompson',
      specialization: 'Pediatric Dermatologist',
      hospital: 'Children\'s Medical Center',
      contactNumber: '+1 (555) 567-8901',
      address: '654 Kids Care Lane, Family District',
      rating: 4.7,
      experience: '10+ years',
    },
  ];

  private static mockHospitals: Omit<Hospital, 'distance'>[] = [
    {
      id: '1',
      name: 'City Medical Center',
      address: '123 Medical Plaza, Downtown',
      contactNumber: '+1 (555) 123-4567',
      type: 'hospital',
      rating: 4.5,
      hasEmergency: true,
      specialties: ['Dermatology', 'Oncology', 'Surgery'],
    },
    {
      id: '2',
      name: 'Skin Health Clinic',
      address: '456 Health Street, Midtown',
      contactNumber: '+1 (555) 234-5678',
      type: 'clinic',
      rating: 4.3,
      hasEmergency: false,
      specialties: ['Dermatology', 'Cosmetic Surgery'],
    },
    {
      id: '3',
      name: 'Cancer Treatment Center',
      address: '789 Oncology Drive, Medical District',
      contactNumber: '+1 (555) 345-6789',
      type: 'specialty_center',
      rating: 4.8,
      hasEmergency: true,
      specialties: ['Oncology', 'Radiation Therapy', 'Chemotherapy'],
    },
    {
      id: '4',
      name: 'Community Health Center',
      address: '321 Community Blvd, Suburbs',
      contactNumber: '+1 (555) 456-7890',
      type: 'clinic',
      rating: 4.2,
      hasEmergency: false,
      specialties: ['General Medicine', 'Dermatology'],
    },
    {
      id: '5',
      name: 'Regional Medical Hospital',
      address: '987 Hospital Way, Medical District',
      contactNumber: '+1 (555) 678-9012',
      type: 'hospital',
      rating: 4.6,
      hasEmergency: true,
      specialties: ['Emergency Medicine', 'Surgery', 'Dermatology'],
    },
  ];

  static async getMedicalRecommendations(
    userLocation: Location,
    riskLevel: RiskLevel,
    searchRadius: number = 25
  ): Promise<MedicalRecommendations> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate distances and filter by radius
    const doctorsWithDistance = this.mockDoctors
      .map(doctor => ({
        ...doctor,
        distance: this.calculateMockDistance(userLocation),
      }))
      .filter(doctor => doctor.distance <= searchRadius)
      .sort((a, b) => {
        // Sort by priority based on risk level, then by distance
        if (riskLevel === 'high') {
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
        }
        return a.distance - b.distance;
      });

    const hospitalsWithDistance = this.mockHospitals
      .map(hospital => ({
        ...hospital,
        distance: this.calculateMockDistance(userLocation),
        googleMapsUrl: LocationService.generateGoogleMapsUrl(hospital.address),
      }))
      .filter(hospital => hospital.distance <= searchRadius)
      .sort((a, b) => {
        // Sort by priority based on risk level, then by distance
        if (riskLevel === 'high') {
          if (a.hasEmergency && !b.hasEmergency) return -1;
          if (!a.hasEmergency && b.hasEmergency) return 1;
          if (a.type === 'specialty_center' && b.type !== 'specialty_center') return -1;
          if (a.type !== 'specialty_center' && b.type === 'specialty_center') return 1;
        }
        return a.distance - b.distance;
      });

    return {
      doctors: doctorsWithDistance,
      hospitals: hospitalsWithDistance,
      userLocation,
      searchRadius,
    };
  }

  private static calculateMockDistance(userLocation: Location): number {
    // Generate realistic mock distances (1-30 km)
    return Math.round((Math.random() * 29 + 1) * 10) / 10;
  }

  static getRiskLevel(prediction: string, confidence: number): RiskLevel {
    if (prediction === 'malignant') {
      return confidence > 70 ? 'high' : 'medium';
    } else if (prediction === 'uncertain') {
      return 'medium';
    }
    return 'low';
  }

  static getRiskLevelMessage(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'high':
        return 'High priority - Immediate medical attention recommended';
      case 'medium':
        return 'Medium priority - Schedule appointment within a week';
      case 'low':
        return 'Low priority - Routine check-up recommended';
    }
  }

  static getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
    }
  }
}