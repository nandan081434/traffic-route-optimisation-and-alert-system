/**
 * SmartRoute Map Configuration
 *
 * Configurable map provider system supporting zero-API-key OpenStreetMap standard tiles
 * with proper attribution and future provider extensibility.
 */

export const MAP_CONFIG = {
  // Default coordinates centered on the SmartRoute Metro Tech Corridor
  defaultCenter: [12.9520, 77.6100],
  defaultZoom: 13,
  minZoom: 10,
  maxZoom: 19,

  // Available tile providers (Zero paid API key required)
  providers: {
    // Primary: OpenStreetMap standard tiles (Free, Open, No API key)
    osm: {
      id: 'osm',
      name: 'OpenStreetMap Standard',
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      className: 'dark-map-tiles',
      requiresApiKey: false
    },

    // Secondary / Alternative: Standard OSM without dark filter
    osmLight: {
      id: 'osmLight',
      name: 'OpenStreetMap Light',
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      className: '',
      requiresApiKey: false
    }
  },

  // Active default provider
  activeProvider: 'osm',

  // Fallback notice message if tiles are temporarily unreachable
  fallbackNotice: 'Map tiles unavailable. Showing traffic network overlay.'
};

/**
 * Returns the active map tile configuration object
 */
export function getActiveMapConfig() {
  const providerKey = MAP_CONFIG.activeProvider || 'osm';
  return MAP_CONFIG.providers[providerKey] || MAP_CONFIG.providers.osm;
}

export default MAP_CONFIG;
