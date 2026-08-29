import React, { useState, useEffect } from 'react';
import {
  DashboardData,
  User,
  NotificationItem,
  CropScheduleItem,
  MarketPrice,
  AlertItem
} from './types';
import { translations } from './translations';
import { apiService } from './services/api';
import { soundService } from './services/sound';

import { Header } from './components/Header';
import { MasterOrchestratorView } from './components/MasterOrchestratorView';
import { AIFarmManager } from './components/AIFarmManager';
import { AIAlertCenter } from './components/AIAlertCenter';
import { VoiceAlert } from './components/VoiceAlert';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { CropVisionAI } from './components/CropVisionAI';
import { SmartIrrigationWeather } from './components/SmartIrrigationWeather';
import { SoilFertilizerAI } from './components/SoilFertilizerAI';
import { CropYieldProfit } from './components/CropYieldProfit';
import { MarketIntelligence } from './components/MarketIntelligence';
import { CropSchedules } from './components/CropSchedules';
import { NotificationCenter } from './components/NotificationCenter';
import { SettingsView } from './components/SettingsView';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { AuthModal } from './components/AuthModal';
import { ThankYouModal } from './components/ThankYouModal';
import { ThankYouView } from './components/ThankYouView';

import {
  Cpu,
  Mic,
  Volume2,
  Camera,
  Droplets,
  Sprout,
  DollarSign,
  Store,
  Calendar,
  Bell,
  Settings,
  Bot,
  RefreshCw,
  Sparkles,
  HeartHandshake,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [activeTab, setActiveTab] = useState<string>('manager');
  const [user, setUser] = useState<User | null>({
    id: 'usr_001',
    username: 'farmer_ramesh',
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'ramesh.farmer@agrimind.ai',
    role: 'farmer',
    location: 'Guntur, Andhra Pradesh',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString()
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [schedules, setSchedules] = useState<CropScheduleItem[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [topBannerAlert, setTopBannerAlert] = useState<AlertItem | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  // Check URL query parameters for direct tab navigation (e.g. ?tab=thankyou)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetTab = params.get('tab') || params.get('view');
      if (targetTab === 'thankyou' || targetTab === 'thank-you') {
        setActiveTab('thankyou');
      } else if (targetTab && ['manager', 'alertcenter', 'master', 'vision', 'weather', 'soil', 'economics', 'market', 'schedule', 'notifications', 'settings'].includes(targetTab)) {
        setActiveTab(targetTab);
      }
    } catch {
      // safe
    }
  }, []);

  // Load all initial data from backend API
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [dash, notifs, scheds, mkt, alertsRes] = await Promise.all([
        apiService.getDashboard(),
        apiService.getNotifications(),
        apiService.getCropSchedules(),
        apiService.getMarketPrices(),
        apiService.getCriticalAlerts().catch(() => ({ success: false, alerts: [] }))
      ]);

      setDashboardData(dash);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      setSchedules(scheds);
      setMarketPrices(mkt.markets);

      if (alertsRes.success && alertsRes.alerts && alertsRes.alerts.length > 0) {
        setTopBannerAlert(alertsRes.alerts[0]);
      }
    } catch (err) {
      console.error('Failed to fetch AgriMind farm data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auth Handlers
  const handleLogout = () => {
    setUser(null);
    soundService.playChime();
    setNotifications(prev => [
      {
        id: `notif_logout_${Date.now()}`,
        type: 'general',
        priority: 'LOW',
        title: language === 'te' ? 'లాగౌట్ విజయవంతమైంది' : 'Logged Out Successfully',
        message: language === 'te' ? 'మీ సెషన్ ముగిసింది. 24/7 AI నిఘా కొనసాగుతుంది.' : 'Session closed. AgriMind background AI continues 24/7 farm surveillance.',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setUnreadCount(prev => prev + 1);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    soundService.playSuccess();
    setNotifications(prev => [
      {
        id: `notif_login_${Date.now()}`,
        type: 'general',
        priority: 'LOW',
        title: language === 'te' ? `స్వాగతం, ${authenticatedUser.name}` : `Welcome back, ${authenticatedUser.name}!`,
        message: language === 'te' ? 'మీ స్మార్ట్ వ్యవసాయ డ్యాష్‌బోర్డ్ కనెక్ట్ అయింది.' : 'Your farm telemetry and cloud decision models are synchronized.',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setUnreadCount(prev => prev + 1);
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id: string) => {
    await apiService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllNotificationsRead = async () => {
    await apiService.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = async (id: string) => {
    await apiService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleExecuteMasterAction = async (actionId: string) => {
    await apiService.executeMasterAction(actionId);
    // Reload dashboard state
    const dash = await apiService.getDashboard();
    setDashboardData(dash);
    const notifs = await apiService.getNotifications();
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.isRead).length);
  };

  // Schedule Handlers
  const handleAddSchedule = async (newTask: Partial<CropScheduleItem>) => {
    const created = await apiService.createCropSchedule(newTask);
    setSchedules(prev => [...prev, created]);
    soundService.playChime();
  };

  const handleUpdateScheduleStatus = async (id: string, status: 'Pending' | 'Completed' | 'Postponed') => {
    const updated = await apiService.updateCropSchedule(id, { status });
    setSchedules(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleDeleteSchedule = async (id: string) => {
    await apiService.deleteCropSchedule(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveFarmSettings = async (farmData: any) => {
    const updated = await apiService.updateFarm(farmData);
    if (dashboardData) {
      setDashboardData({
        ...dashboardData,
        farm: updated
      });
    }
  };

  const navTabs = [
    { id: 'manager', label: language === 'te' ? 'వాయిస్ ఫార్మ్ మేనేజర్' : 'AI Farm Manager', icon: Mic, badge: 'Voice AI' },
    { id: 'alertcenter', label: language === 'te' ? 'హెచ్చరిక కేంద్రం' : 'AI Alert Center', icon: AlertTriangle, badge: 'Active' },
    { id: 'master', label: language === 'te' ? 'మాస్టర్ AI ఏజెంట్' : 'Master AI Agent', icon: Cpu, badge: '95% AI' },
    { id: 'vision', label: language === 'te' ? 'తెగుళ్ల గుర్తింపు' : 'Crop Vision AI', icon: Camera, badge: 'Pathology' },
    { id: 'weather', label: language === 'te' ? 'వాతావరణం & నీరు' : 'Weather & Irrigation', icon: Droplets, badge: 'FAO-56' },
    { id: 'soil', label: language === 'te' ? 'నేల & ఎరువులు' : 'Soil & Fertilizers', icon: Sprout, badge: 'NPK Card' },
    { id: 'economics', label: language === 'te' ? 'లాభం & దిగుబడి' : 'Yield & Economics', icon: DollarSign, badge: 'ROI Calc' },
    { id: 'market', label: language === 'te' ? 'మండి ధరలు' : 'Mandi Market', icon: Store, badge: 'Live APMC' },
    { id: 'schedule', label: language === 'te' ? 'పంట క్యాలెండర్' : 'Crop Calendar', icon: Calendar, badge: `${schedules.length}` },
    { id: 'notifications', label: language === 'te' ? 'నోటిఫికేషన్లు' : 'Alerts & Alarms', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : undefined },
    { id: 'settings', label: language === 'te' ? 'సెట్టింగ్స్' : 'Farm Settings', icon: Settings },
    { id: 'thankyou', label: language === 'te' ? 'ధన్యవాదాలు' : 'Thank You & Links', icon: HeartHandshake, badge: 'Share' }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Inter'] text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* Top Header */}
      <Header
        user={user}
        language={language}
        onLanguageChange={setLanguage}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationClick={(n) => {
          handleMarkNotificationRead(n.id);
          if (n.type === 'rain' || n.type === 'irrigation') setActiveTab('weather');
          else if (n.type === 'disease') setActiveTab('vision');
          else if (n.type === 'fertilizer') setActiveTab('soil');
          else setActiveTab('notifications');
        }}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onOpenNotificationsPage={() => setActiveTab('notifications')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenThankYou={() => setActiveTab('thankyou')}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundService.setEnabled(next);
        }}
        onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
      />

      {/* Primary Tab Navigation Strip */}
      <nav aria-label="Primary Navigation" className="bg-white border-b border-slate-200/80 sticky top-16 sm:top-18 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-xs scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-emerald-600 text-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Prominent Floating/Top VoiceAlert for Critical/High alerts */}
        {topBannerAlert && topBannerAlert.status !== 'RESOLVED' && (
          <VoiceAlert
            alert={topBannerAlert}
            onAcknowledge={async (id) => {
              await apiService.acknowledgeAlert(id);
              setTopBannerAlert(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : null);
            }}
            onClose={() => setTopBannerAlert(null)}
            onViewDetails={() => setActiveTab('alertcenter')}
          />
        )}

        {loading && !dashboardData ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
            <p className="text-sm font-semibold text-slate-600">
              Synchronizing AgriMind autonomous telemetry and satellite weather...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'manager' && (
              <AIFarmManager
                language={language}
                farm={dashboardData?.farm}
                crop={dashboardData?.crop}
                soil={dashboardData?.soil}
                weather={dashboardData?.weather}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              />
            )}

            {activeTab === 'alertcenter' && (
              <AIAlertCenter
                language={language}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
              />
            )}

            {activeTab === 'master' && (
              <MasterOrchestratorView
                decision={dashboardData?.masterDecision || null}
                dashboardData={dashboardData}
                language={language}
                onExecuteAction={handleExecuteMasterAction}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'vision' && (
              <CropVisionAI
                language={language}
                onAddNotification={(n) => setNotifications(prev => [n, ...prev])}
              />
            )}

            {activeTab === 'weather' && (
              <SmartIrrigationWeather
                weather={dashboardData?.weather || null}
                language={language}
                onExecuteIrrigation={() => {
                  handleExecuteMasterAction('act_irrig_execute');
                  soundService.playChime();
                }}
              />
            )}

            {activeTab === 'soil' && (
              <SoilFertilizerAI
                initialSoil={dashboardData?.soil || null}
                language={language}
              />
            )}

            {activeTab === 'economics' && (
              <CropYieldProfit
                language={language}
              />
            )}

            {activeTab === 'market' && (
              <MarketIntelligence
                markets={marketPrices}
                language={language}
              />
            )}

            {activeTab === 'schedule' && (
              <CropSchedules
                schedules={schedules}
                language={language}
                onAddSchedule={handleAddSchedule}
                onUpdateStatus={handleUpdateScheduleStatus}
                onDeleteSchedule={handleDeleteSchedule}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenter
                notifications={notifications}
                language={language}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onDeleteNotification={handleDeleteNotification}
                soundEnabled={soundEnabled}
                onToggleSound={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  soundService.setEnabled(next);
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                farm={dashboardData?.farm || null}
                crop={dashboardData?.crop || null}
                language={language}
                soundEnabled={soundEnabled}
                onToggleSound={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  soundService.setEnabled(next);
                }}
                onSaveFarmSettings={handleSaveFarmSettings}
              />
            )}

            {activeTab === 'thankyou' && (
              <ThankYouView
                user={user}
                dashboardData={dashboardData}
                language={language}
                onNavigateToDashboard={() => setActiveTab('manager')}
                onOpenLogin={() => setIsAuthOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}

      </main>

      {/* Floating AI Agronomist Chat Trigger Button */}
      <button
        id="btn-floating-ai-chat"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:px-5 sm:py-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center space-x-2.5 border border-emerald-400/30 group cursor-pointer"
        title="Open AgriMind AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-tight font-['Outfit']">
          {language === 'te' ? 'AI వ్యవసాయ సహాయకుడు' : 'AgriMind AI Assistant'}
        </span>
      </button>

      {/* Voice & Alarm Configuration Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
      />

      {/* AI Chatbot Drawer */}
      <ChatbotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        language={language}
      />

      {/* Farmer Auth & Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        language={language}
      />

      {/* Thank You & Session Summary Modal */}
      <ThankYouModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
        language={language}
        farmerName={user?.name}
        onNavigateToThankYouPage={() => setActiveTab('thankyou')}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700 font-['Outfit']">AgriMind AI Agriculture</span>
            <span>• Voice-Enabled Agentic AI Farm Manager</span>
          </div>
          <p className="text-slate-400">
            Dedicated to Indian & Global Farmers • Annadata Sukhibhava (అన్నదాతా సుఖీభవ)
          </p>
        </div>
      </footer>

    </div>
  );
}
export default App;

