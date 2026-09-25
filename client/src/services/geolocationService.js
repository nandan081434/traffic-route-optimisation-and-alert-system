/**
 * SmartRoute - Geolocation Service
 * Handles browser Geolocation API with robust permission and error states.
 */

export const DEFAULT_ORIGIN = {
  name: "North Gate Tech Hub",
  address: "Outer Ring Road, North Gateway, Bengaluru",
  latitude: 12.9760,
  longitude: 77.5920,
  isDefault: true
};

export const GeolocationStatus = {
  IDLE: 'IDLE',
  PROMPTING: 'PROMPTING',
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  UNAVAILABLE: 'UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  ERROR: 'ERROR'
};

export const geolocationService = {
  /**
   * Check if Geolocation is supported in current environment
   */
  isSupported() {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  },

  /**
   * Request device position with timeout & error mapping
   */
  async getCurrentPosition(options = {}) {
    if (!this.isSupported()) {
      return {
        status: GeolocationStatus.UNAVAILABLE,
        location: DEFAULT_ORIGIN,
        error: "Geolocation is not supported by your browser."
      };
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      ...options
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            status: GeolocationStatus.GRANTED,
            location: {
              name: "My Current Location",
              address: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp
            },
            error: null
          });
        },
        (error) => {
          let status = GeolocationStatus.ERROR;
          let userMessage = "Unable to retrieve your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              status = GeolocationStatus.DENIED;
              userMessage = "Location permission was denied. Using simulated location.";
              break;
            case error.POSITION_UNAVAILABLE:
              status = GeolocationStatus.UNAVAILABLE;
              userMessage = "Location information is unavailable. Using simulated location.";
              break;
            case error.TIMEOUT:
              status = GeolocationStatus.TIMEOUT;
              userMessage = "Location request timed out. Using simulated location.";
              break;
            default:
              status = GeolocationStatus.ERROR;
              userMessage = error.message || "An unknown location error occurred.";
          }

          resolve({
            status,
            location: DEFAULT_ORIGIN,
            error: userMessage
          });
        },
        defaultOptions
      );
    });
  }
};
