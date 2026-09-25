import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { NotificationToast, NotificationDrawer } from '../components/Notification.jsx';
import ReportIssueModal from '../components/ReportIssueModal.jsx';
import { LayoutDashboard, Map as MapIcon, Activity, Bell, Menu } from 'lucide-react';

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  isLive,
  notifications = [],
  onDismissNotification,
  onClearNotifications,
  presentationMode,
  setPresentationMode,
  children
}) {
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Toast Alert popups */}
      <NotificationToast
        notifications={notifications}
        onDismiss={onDismissNotification}
        onViewRoute={() => {
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Slide-out Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onClear={onClearNotifications}
      />

      {/* User Issue Reporting Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Main Top Navbar */}
      <Navbar
        isLive={isLive}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        isMobileMenuOpen={isMobileDrawerOpen}
      />

      {/* Main Content Layout Container */}
      <div className={`flex-1 w-full pb-16 md:pb-0 overflow-x-hidden ${
        presentationMode
          ? 'flex flex-col'
          : 'md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]'
      }`}>
        {!presentationMode && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMobileDrawerOpen={isMobileDrawerOpen}
            setIsMobileDrawerOpen={setIsMobileDrawerOpen}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            presentationMode={presentationMode}
            setPresentationMode={setPresentationMode}
          />
        )}

        <main className={`min-w-0 w-full p-2.5 sm:p-4 lg:p-6 overflow-x-hidden relative z-1 ${
          presentationMode ? 'w-full' : ''
        }`}>
          {children}
        </main>
      </div>

      {/* Point 27: MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel bg-slate-950/95 border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-xl"
        style={{ paddingBottom: 'calc(0.375rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${
            activeTab === 'dashboard' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${
            activeTab === 'map' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapIcon size={18} />
          <span>Map</span>
        </button>

        <button
          onClick={() => setActiveTab('traffic')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${
            activeTab === 'traffic' ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={18} />
          <span>Traffic</span>
        </button>

        <button
          onClick={() => setIsNotificationsDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <Bell size={18} />
          <span>Alerts</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all active:scale-95 ${
            isMobileDrawerOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
