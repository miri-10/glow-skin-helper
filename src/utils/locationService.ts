import { Location } from '@/types/medical';

export class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  static async geocodeCity(city: string): Promise<Location> {
    // In a real implementation, you would use a geocoding service
    // For now, we'll return mock coordinates for common cities
    const cityCoordinates: Record<string, Location> = {
      'new york': { latitude: 40.7128, longitude: -74.0060, city: 'New York' },
      'los angeles': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles' },
      'chicago': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago' },
      'houston': { latitude: 29.7604, longitude: -95.3698, city: 'Houston' },
      'phoenix': { latitude: 33.4484, longitude: -112.0740, city: 'Phoenix' },
      'philadelphia': { latitude: 39.9526, longitude: -75.1652, city: 'Philadelphia' },
      'san antonio': { latitude: 29.4241, longitude: -98.4936, city: 'San Antonio' },
      'san diego': { latitude: 32.7157, longitude: -117.1611, city: 'San Diego' },
      'dallas': { latitude: 32.7767, longitude: -96.7970, city: 'Dallas' },
      'san jose': { latitude: 37.3382, longitude: -121.8863, city: 'San Jose' },
      'london': { latitude: 51.5074, longitude: -0.1278, city: 'London' },
      'paris': { latitude: 48.8566, longitude: 2.3522, city: 'Paris' },
      'tokyo': { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo' },
      'sydney': { latitude: -33.8688, longitude: 151.2093, city: 'Sydney' },
      'mumbai': { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai' },
      'delhi': { latitude: 28.7041, longitude: 77.1025, city: 'Delhi' },
      'bangalore': { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore' },
    };

    const normalizedCity = city.toLowerCase().trim();
    const location = cityCoordinates[normalizedCity];
    
    if (!location) {
      throw new Error(`City "${city}" not found. Please try a major city name.`);
    }

    return location;
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static generateGoogleMapsUrl(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }
}