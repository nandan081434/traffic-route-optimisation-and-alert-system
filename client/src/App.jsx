import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles, Radio, Activity, TrafficCone } from 'lucide-react';

import DashboardLayout from './layouts/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Traffic from './pages/Traffic.jsx';
import TrafficKits from './pages/TrafficKits.jsx';
import Signals from './pages/Signals.jsx';
import Construction from './pages/Construction.jsx';
import Incidents from './pages/Incidents.jsx';
import Analytics from './pages/Analytics.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';
import MapView from './components/MapView.jsx';

import { useTraffic } from './hooks/useTraffic.js';
import { useRoute } from './hooks/useRoute.js';
import { useSocket } from './hooks/useSocket.js';
import { getSocket } from './services/socket.js';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [presentationMode, setPresentationMode] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'initial-alert',
      type: 'SYSTEM',
      title: 'Roadside Monitoring Kits Connected',
      message: '8 active IoT kits transmitting vehicle count units and queue measurements.',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  // Global hooks
  const {
    kits,
    signals,
    incidents,
    construction,
    network,
    loading: trafficLoading,
    isDemoFallback,
    refreshTraffic
  } = useTraffic();

  const {
    routes,
    selectedRoute,
    recommendedRoute,
    selectedRouteId,
    setSelectedRouteId,
    explanation,
    isRecalculating,
    calcStatusText,
    savedMinutes,
    refreshRoutes
  } = useRoute();

  const { isConnected } = useSocket();

  // Point 9: Quick graceful landing transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Socket notification listener
  useEffect(() => {
    const socket = getSocket();
    function onNewNotification(notif) {
      setNotifications(prev => [notif, ...prev]);
    }
    socket.on('notification:new', onNewNotification);
    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, []);

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      {/* Point 9: Initial Experience Splash Transition */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] text-white p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center space-y-4 max-w-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40 border border-cyan-400">
                <Compass size={36} className="text-white animate-spin-slow" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                  SMARTROUTE
                </h1>
                <p className="text-xs text-cyan-300 font-medium tracking-wide mt-1">
                  Intelligent Traffic & Navigation
                </p>
              </div>

              {/* 4 Feature Labels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-4 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  🟢 Live Traffic
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  🚦 Smart Signals
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  📡 Road Intelligence
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  ⚡ Dynamic Routing
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard Application Shell */}
      <DashboardLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLive={isConnected && !isDemoFallback}
        notifications={notifications}
        onDismissNotification={handleDismissNotification}
        onClearNotifications={handleClearNotifications}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                kits={kits}
                signals={signals}
                incidents={incidents}
                construction={construction}
                network={network}
                routes={routes}
                selectedRoute={selectedRoute}
                recommendedRoute={recommendedRoute}
                selectedRouteId={selectedRouteId}
                setSelectedRouteId={setSelectedRouteId}
                explanation={explanation}
                isRecalculating={isRecalculating}
                calcStatusText={calcStatusText}
                savedMinutes={savedMinutes}
                refreshTraffic={refreshTraffic}
                refreshRoutes={refreshRoutes}
                presentationMode={presentationMode}
                setPresentationMode={setPresentationMode}
              />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">FULL NETWORK MAP VIEW</h1>
                  <p className="text-xs text-slate-400">Explore junctions, roadside kits, and candidate routes.</p>
                </div>
              </div>
              <MapView
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(r) => setSelectedRouteId(r.id)}
                kits={kits}
                signals={signals}
                incidents={incidents}
                construction={construction}
                network={network}
                isRecalculating={isRecalculating}
                calcStatusText={calcStatusText}
                savedMinutes={savedMinutes}
                presentationMode={true}
              />
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div
              key="traffic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Traffic kits={kits} network={network} />
            </motion.div>
          )}

          {activeTab === 'kits' && (
            <motion.div
              key="kits"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TrafficKits
                kits={kits}
                refreshTraffic={refreshTraffic}
                refreshRoutes={refreshRoutes}
              />
            </motion.div>
          )}

          {activeTab === 'signals' && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Signals signals={signals} />
            </motion.div>
          )}

          {activeTab === 'construction' && (
            <motion.div
              key="construction"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Construction
                construction={construction}
                refreshTraffic={refreshTraffic}
                refreshRoutes={refreshRoutes}
              />
            </motion.div>
          )}

          {activeTab === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Incidents incidents={incidents} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Analytics />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Admin
                kits={kits}
                signals={signals}
                incidents={incidents}
                construction={construction}
                network={network}
                refreshTraffic={refreshTraffic}
                refreshRoutes={refreshRoutes}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Settings isSocketConnected={isConnected} />
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </>
  );
}
