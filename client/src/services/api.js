/**
 * SmartRoute - Frontend API Service
 * Supports environment-configurable backend (VITE_API_URL) with robust
 * offline prototype resilience for static Netlify deployment.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${API_BASE}/api`;

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    // Non-blocking log to ensure static Netlify frontend never crashes
    console.warn(`[SmartRoute API] ${endpoint} unavailable (running in prototype mode):`, error.message);
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health').catch(() => ({ status: 'STANDALONE_PROTOTYPE' })),

  // Traffic & Analytics
  getTrafficOverview: () => request('/traffic'),
  getHistoricalAnalytics: () => request('/traffic/analytics'),
  getRoadTraffic: (roadId) => request(`/traffic/${roadId}`),

  // Traffic Kits
  getKits: () => request('/traffic-kits'),
  getKit: (id) => request(`/traffic-kits/${id}`),
  addKit: (data) => request('/traffic-kits', { method: 'POST', body: JSON.stringify(data) }),
  editKit: (id, data) => request(`/traffic-kits/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeKit: (id) => request(`/traffic-kits/${id}`, { method: 'DELETE' }),
  sendHardwareTelemetry: (data) => request('/traffic-kits/update', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ success: true, localMock: true })),

  // Signals
  getSignals: () => request('/signals'),
  getSignal: (id) => request(`/signals/${id}`),
  addSignal: (data) => request('/signals', { method: 'POST', body: JSON.stringify(data) }),
  editSignal: (id, data) => request(`/signals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Incidents
  getIncidents: () => request('/incidents'),
  addIncident: (data) => request('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  editIncident: (id, data) => request(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeIncident: (id) => request(`/incidents/${id}`, { method: 'DELETE' }),

  // Construction
  getConstruction: () => request('/construction'),
  addConstruction: (data) => request('/construction', { method: 'POST', body: JSON.stringify(data) }),
  editConstruction: (id, data) => request(`/construction/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeConstruction: (id) => request(`/construction/${id}`, { method: 'DELETE' }),

  // Routes & Simulations
  getRoutes: () => request('/routes'),
  calculateRoutes: () => request('/routes/calculate', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  simulateHeavyTraffic: () => request('/routes/simulate-heavy-traffic', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  simulateAccident: () => request('/routes/simulate-accident', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  simulateConstruction: () => request('/routes/simulate-construction', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  simulateClosure: () => request('/routes/simulate-closure', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  resetTraffic: () => request('/routes/reset-traffic', { method: 'POST' }).catch(() => ({ success: true, localMock: true })),
  triggerDemoStep: (step) => request('/routes/demo-step', { method: 'POST', body: JSON.stringify({ step }) }).catch(() => ({ success: true, step })),
  toggleSimulation: (action) => request('/routes/simulation-control', { method: 'POST', body: JSON.stringify({ action }) }).catch(() => ({ success: true, action })),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  clearNotifications: () => request('/notifications', { method: 'DELETE' })
};
