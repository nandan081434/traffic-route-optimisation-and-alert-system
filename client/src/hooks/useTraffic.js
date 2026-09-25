import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import {
  fallbackKits,
  fallbackSignals,
  fallbackIncidents,
  fallbackConstruction,
  fallbackNetwork
} from '../data/fallbackData.js';

export function useTraffic() {
  const [kits, setKits] = useState(fallbackKits);
  const [signals, setSignals] = useState(fallbackSignals);
  const [incidents, setIncidents] = useState(fallbackIncidents);
  const [construction, setConstruction] = useState(fallbackConstruction);
  const [network, setNetwork] = useState(fallbackNetwork);
  const [loading, setLoading] = useState(true);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, signalsRes, incidentsRes, constructionRes] = await Promise.all([
        api.getTrafficOverview().catch(() => null),
        api.getSignals().catch(() => null),
        api.getIncidents().catch(() => null),
        api.getConstruction().catch(() => null)
      ]);

      if (overviewRes && overviewRes.kits) {
        setKits(overviewRes.kits);
        setNetwork({ roads: overviewRes.roads || [] });
        setIsDemoFallback(false);
      } else {
        setIsDemoFallback(true);
      }

      if (signalsRes && signalsRes.signals) {
        setSignals(signalsRes.signals);
      }
      if (incidentsRes && incidentsRes.incidents) {
        setIncidents(incidentsRes.incidents);
      }
      if (constructionRes && constructionRes.construction) {
        setConstruction(constructionRes.construction);
      }
    } catch (err) {
      console.warn('[useTraffic] API offline, operating with fallback dataset:', err.message);
      setIsDemoFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const socket = getSocket();

    function onSnapshot(data) {
      if (data.kits) setKits(data.kits);
      if (data.signals) setSignals(data.signals);
      if (data.incidents) setIncidents(data.incidents);
      if (data.construction) setConstruction(data.construction);
      if (data.network) setNetwork(data.network);
      setIsDemoFallback(false);
      setLastUpdate(new Date().toISOString());
    }

    function onTrafficUpdate(data) {
      if (data.kits) setKits(data.kits);
      if (data.signals) setSignals(data.signals);
      setLastUpdate(new Date().toISOString());
    }

    function onKitUpdate(kit) {
      setKits(prev => prev.map(k => (k.id === kit.id ? kit : k)));
      setLastUpdate(new Date().toISOString());
    }

    function onIncidentNew(inc) {
      setIncidents(prev => [inc, ...prev.filter(i => i.id !== inc.id)]);
    }

    function onConstructionUpdate(con) {
      setConstruction(prev => [con, ...prev.filter(c => c.id !== con.id)]);
    }

    function onReset(data) {
      if (data.kits) setKits(data.kits);
      if (data.signals) setSignals(data.signals);
      setLastUpdate(new Date().toISOString());
    }

    socket.on('traffic:snapshot', onSnapshot);
    socket.on('traffic:update', onTrafficUpdate);
    socket.on('kit:update', onKitUpdate);
    socket.on('incident:new', onIncidentNew);
    socket.on('construction:update', onConstructionUpdate);
    socket.on('traffic:reset', onReset);

    return () => {
      socket.off('traffic:snapshot', onSnapshot);
      socket.off('traffic:update', onTrafficUpdate);
      socket.off('kit:update', onKitUpdate);
      socket.off('incident:new', onIncidentNew);
      socket.off('construction:update', onConstructionUpdate);
      socket.off('traffic:reset', onReset);
    };
  }, [fetchData]);

  return {
    kits,
    signals,
    incidents,
    construction,
    network,
    loading,
    isDemoFallback,
    lastUpdate,
    refreshTraffic: fetchData
  };
}
