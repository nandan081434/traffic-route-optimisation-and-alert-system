/**
 * SmartRoute - Real Geocoding & Place Search Service
 * Connects to live geocoding (Nominatim, Photon, or configurable VITE_GEOCODING_API_URL)
 * with verified real Indian cities and global landmark directory.
 */

import { realPlacesDirectory } from '../data/fallbackData.js';

const GEOCODING_API_URL = import.meta.env.VITE_GEOCODING_API_URL || '';

export const geocodingService = {
  /**
   * Search places by query string
   * Returns array of { id, name, address, latitude, longitude, category, isReal }
   */
  async searchPlaces(query) {
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return realPlacesDirectory.slice(0, 6);
    }

    const trimmed = query.trim().toLowerCase();

    // 1. Check verified Indian cities & landmarks directory first (instant sub-millisecond match)
    const localMatches = realPlacesDirectory.filter((p) =>
      p.name.toLowerCase().includes(trimmed) ||
      p.address.toLowerCase().includes(trimmed)
    );

    // 2. Fetch live geocoding results from Nominatim / Photon / custom endpoint
    let liveResults = [];

    // Option A: Custom configured VITE_GEOCODING_API_URL
    if (GEOCODING_API_URL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${GEOCODING_API_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            liveResults = data.map((item, idx) => ({
              id: `custom-${item.place_id || idx}`,
              name: item.name || (item.display_name ? item.display_name.split(',')[0].trim() : query),
              address: item.display_name || item.name,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              category: item.type || 'Location',
              isReal: true
            }));
          }
        }
      } catch (err) {
        console.warn('Custom geocoding endpoint error:', err.message);
      }
    }

    // Option B: Photon OpenStreetMap geocoding API (Fast, CORS-friendly, zero API key)
    if (liveResults.length === 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            liveResults = data.features.map((feat, idx) => {
              const p = feat.properties || {};
              const coords = feat.geometry?.coordinates || [0, 0];
              const title = p.name || query;
              const details = [p.name, p.city || p.county, p.state, p.country].filter(Boolean).join(', ');
              return {
                id: `photon-${p.osm_id || idx}`,
                name: title,
                address: details,
                latitude: coords[1],
                longitude: coords[0],
                category: p.type || p.osm_value || 'Place',
                isReal: true
              };
            });
          }
        }
      } catch (err) {
        // Fall through to Nominatim
      }
    }

    // Option C: Nominatim OpenStreetMap Search
    if (liveResults.length === 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            liveResults = data.map((item, idx) => ({
              id: `osm-${item.place_id || idx}`,
              name: item.name || (item.display_name ? item.display_name.split(',')[0].trim() : query),
              address: item.display_name,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              category: item.type || 'Location',
              isReal: true
            }));
          }
        }
      } catch (err) {
        // Continue to local directory fallback
      }
    }

    // Deduplicate and combine results: live results first, followed by local directory matches
    const combined = [...liveResults];
    localMatches.forEach((loc) => {
      const exists = combined.some(
        c => c.name.toLowerCase() === loc.name.toLowerCase() ||
             (Math.abs(c.latitude - loc.latitude) < 0.05 && Math.abs(c.longitude - loc.longitude) < 0.05)
      );
      if (!exists) {
        combined.push(loc);
      }
    });

    return combined;
  },

  /**
   * Geocode a single location query into exact coordinates.
   * Throws an error if the location cannot be resolved.
   */
  async geocode(query) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Location not found. Please enter a valid place, area, city, or landmark.');
    }

    const trimmed = query.trim().toLowerCase();

    // 1. Direct match in verified cities dictionary
    const directMatch = realPlacesDirectory.find(
      p => p.name.toLowerCase() === trimmed || p.address.toLowerCase().includes(trimmed)
    );
    if (directMatch) {
      return directMatch;
    }

    // 2. Partial match in directory
    const partialMatch = realPlacesDirectory.find(
      p => p.name.toLowerCase().includes(trimmed) || trimmed.includes(p.name.toLowerCase())
    );
    if (partialMatch) {
      return partialMatch;
    }

    // 3. Live search
    const results = await this.searchPlaces(query);
    if (results && results.length > 0) {
      return results[0];
    }

    throw new Error('Location not found. Please enter a valid place, area, city, or landmark.');
  },

  /**
   * Reverse geocode latitude and longitude to readable address
   */
  async reverseGeocode(latitude, longitude) {
    // 1. First check proximity to verified directory
    const nearby = realPlacesDirectory.find(p => {
      const dLat = Math.abs(p.latitude - latitude);
      const dLng = Math.abs(p.longitude - longitude);
      return dLat < 0.08 && dLng < 0.08;
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          return {
            name: parts.slice(0, 2).join(',').trim(),
            address: data.display_name,
            latitude,
            longitude,
            isReal: true
          };
        }
      }
    } catch {
      // Fallback
    }

    if (nearby) {
      return {
        name: nearby.name,
        address: nearby.address,
        latitude,
        longitude,
        isReal: true
      };
    }

    return {
      name: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      address: `Coordinates: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      latitude,
      longitude,
      isReal: true
    };
  }
};
