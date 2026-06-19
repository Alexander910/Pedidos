export interface MapRouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometryPolyline: string; // Encoded polyline path for drawing on maps
}

export interface MapGeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
}

export type MapProviderType = 'google' | 'mapbox';

export class EnviosYaMapsService {
  private provider: MapProviderType;
  private googleApiKey?: string;
  private mapboxToken?: string;

  constructor(config: {
    provider: MapProviderType;
    googleApiKey?: string;
    mapboxToken?: string;
  }) {
    this.provider = config.provider;
    this.googleApiKey = config.googleApiKey;
    this.mapboxToken = config.mapboxToken;
  }

  /**
   * Geocodes string address to coordinates
   */
  async geocode(address: string): Promise<MapGeocodingResult> {
    if (this.provider === 'google') {
      // Stub for Google Geocoding API fetch
      console.log(`Geocoding with Google: ${address}`);
      return {
        address,
        latitude: 14.6349,
        longitude: -90.5069,
      };
    } else {
      // Stub for Mapbox Geocoding API fetch
      console.log(`Geocoding with Mapbox: ${address}`);
      return {
        address,
        latitude: 14.6349,
        longitude: -90.5069,
      };
    }
  }

  /**
   * Calculates route details between two coordinates
   */
  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<MapRouteResult> {
    if (this.provider === 'google') {
      // Mock Google Directions API response
      const distance = this.estimateHaversineDistance(origin, destination);
      return {
        distanceKm: Math.round(distance * 1.2 * 10) / 10, // Adjust direct distance for routing
        durationMinutes: Math.round(distance * 3 * 10) / 10, // Est. 3 mins per km in traffic
        geometryPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
      };
    } else {
      // Mock Mapbox Directions API response
      const distance = this.estimateHaversineDistance(origin, destination);
      return {
        distanceKm: Math.round(distance * 1.25 * 10) / 10,
        durationMinutes: Math.round(distance * 2.8 * 10) / 10,
        geometryPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
      };
    }
  }

  /**
   * Fast math estimation for backup or offline usage
   */
  private estimateHaversineDistance(
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
