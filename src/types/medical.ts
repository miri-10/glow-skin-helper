export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  address?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  contactNumber: string;
  address: string;
  distance?: number;
  rating?: number;
  experience?: string;
  isEmergency?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  type: 'hospital' | 'clinic' | 'specialty_center';
  distance?: number;
  rating?: number;
  hasEmergency?: boolean;
  specialties?: string[];
  googleMapsUrl?: string;
}

export interface MedicalRecommendations {
  doctors: Doctor[];
  hospitals: Hospital[];
  userLocation?: Location;
  searchRadius: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';