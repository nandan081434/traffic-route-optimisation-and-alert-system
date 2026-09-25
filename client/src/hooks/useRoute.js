import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { fallbackRoutes, fallbackExplanation } from '../data/fallbackData.js';

export function useRoute() {
  const [routes, setRoutes] = useState(fallbackRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState('route-b');
  const [recommendedRouteId, setRecommendedRouteId] = useState('route-b');
  const [explanation, setExplanation] = useState(fallbackExplanation);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [calcStatusText, setCalcStatusText] = useState('');
  const [savedMinutes, setSavedMinutes] = useState(17);
  const [routeTransitionActive, setRouteTransitionActive] = useState(false);

  const fetchRoutes = useCallback(async () => {
    try {
      const data = await api.getRoutes();
      if (data && data.routes) {
        setRoutes(data.routes);
        if (data.recommendedRoute) {
          setRecommendedRouteId(data.recommendedRoute.id);
          setSelectedRouteId(data.recommendedRoute.id);
        }
        if (data.explanation) {
          setExplanation(data.explanation);
          if (data.explanation.timeSavedMinutes) {
            setSavedMinutes(data.explanation.timeSavedMinutes);
          }
        }
      }
    } catch (err) {
      console.warn('[useRoute] Using fallback routes:', err.message);
    }
  }, []);

  const triggerDynamicRerouteAnimation = useCallback((newResult) => {
    setIsRecalculating(true);
    setCalcStatusText('Analyzing live traffic conditions...');
    setRouteTransitionActive(true);

    setTimeout(() => {
      setCalcStatusText('Calculating optimal alternate routes...');
    }, 600);

    setTimeout(() => {
      setCalcStatusText('Faster alternate route found!');
      if (newResult.routes) setRoutes(newResult.routes);
      if (newResult.recommendedRoute) {
        setRecommendedRouteId(newResult.recommendedRoute.id);
        setSelectedRouteId(newResult.recommendedRoute.id);
      }
      if (newResult.explanation) {
        setExplanation(newResult.explanation);
        setSavedMinutes(newResult.explanation.timeSavedMinutes || newResult.timeSavedMinutes || 17);
      }
    }, 1400);

    setTimeout(() => {
      setIsRecalculating(false);
      setCalcStatusText('');
      setRouteTransitionActive(false);
    }, 3200);
  }, []);

  useEffect(() => {
    fetchRoutes();

    const socket = getSocket();

    function onRouteUpdate(result) {
      if (result.routeChanged) {
        triggerDynamicRerouteAnimation(result);
      } else {
        if (result.routes) setRoutes(result.routes);
        if (result.recommendedRoute) {
          setRecommendedRouteId(result.recommendedRoute.id);
        }
        if (result.explanation) {
          setExplanation(result.explanation);
          setSavedMinutes(result.explanation.timeSavedMinutes || 0);
        }
      }
    }

    function onDemoStep(data) {
      if (data.statusText) {
        setIsRecalculating(true);
        setCalcStatusText(data.statusText);
      }
      if (data.savedMin) {
        setSavedMinutes(data.savedMin);
      }
    }

    socket.on('route:update', onRouteUpdate);
    socket.on('demo:step', onDemoStep);

    return () => {
      socket.off('route:update', onRouteUpdate);
      socket.off('demo:step', onDemoStep);
    };
  }, [fetchRoutes, triggerDynamicRerouteAnimation]);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const recommendedRoute = routes.find(r => r.id === recommendedRouteId) || routes[0];

  return {
    routes,
    selectedRoute,
    recommendedRoute,
    selectedRouteId,
    setSelectedRouteId,
    explanation,
    isRecalculating,
    calcStatusText,
    savedMinutes,
    routeTransitionActive,
    refreshRoutes: fetchRoutes,
    triggerDynamicRerouteAnimation
  };
}
