import React, { useState } from 'react';
import { User, NotificationItem } from '../types';
import { translations } from '../translations';
import { soundService } from '../services/sound';
import {
  Sprout,
  Bell,
  Volume2,
  VolumeX,
  Globe,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Droplets,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  language: 'en' | 'te';
  onLanguageChange: (lang: 'en' | 'te') => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllRead: () => void;
  onOpenNotificationsPage: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenThankYou: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenVoiceSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  language,
  onLanguageChange,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onOpenNotificationsPage,
  onOpenAuth,
  onLogout,
  onOpenThankYou,
  soundEnabled,
  onToggleSound,
  onOpenVoiceSettings
}) => {
  const t = translations[language];
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-800 to-teal-700 bg-clip-text text-transparent font-['Outfit']">
                  AgriMind
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600 animate-pulse" />
                  Voice AI Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {language === 'te' ? 'వాయిస్-ఎనేబుల్డ్ స్మార్ట్ వ్యవసాయ AI మేనేజర్' : 'Voice-Enabled Multi-Agent AI Farm Manager'}
              </p>
            </div>
          </div>

          {/* Farm Quick Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200/70 rounded-full px-3.5 py-1.5 text-xs text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-medium">🌱 Tomato (Flowering)</span>
            <span className="text-emerald-400">•</span>
            <span>2.0 Acres</span>
            <span className="text-emerald-400">•</span>
            <span className="text-emerald-700 font-semibold">Guntur Field #1</span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                id="btn-lang-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                id="btn-lang-te"
                onClick={() => onLanguageChange('te')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'te'
                    ? 'bg-white text-emerald-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Voice & Sound Settings Button */}
            {onOpenVoiceSettings && (
              <button
                id="btn-voice-settings-header"
                onClick={onOpenVoiceSettings}
                title="Voice & Alarm Audio Settings"
                className="p-2 rounded-lg border border-teal-200 bg-teal-50/80 text-teal-800 hover:bg-teal-100 transition-colors flex items-center space-x-1"
              >
                <Volume2 className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold hidden md:inline">Voice AI</span>
              </button>
            )}

            {/* Quick Sound Alerts Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) {
                  soundService.playChime();
                }
              }}
              title={soundEnabled ? 'Sound Alerts: Enabled (Click to Mute)' : 'Sound Alerts: Muted'}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifDropdown && (
                <div 
                  id="dropdown-notifications"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="p-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-emerald-300" />
                      <span className="font-semibold text-sm">
                        {language === 'te' ? 'హెచ్చరికలు & నోటిఫికేషన్లు' : 'Notifications & Alerts'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} {language === 'te' ? 'కొత్తవి' : 'new'}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllRead();
                          setShowNotifDropdown(false);
                        }}
                        className="text-xs text-emerald-200 hover:text-white underline"
                      >
                        {t.markAllAsRead}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No notifications currently
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            onNotificationClick(n);
                            setShowNotifDropdown(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <span className="text-base mt-0.5">
                              {n.type === 'rain' ? '🌧️' : n.type === 'irrigation' ? '💧' : n.type === 'disease' ? '🦠' : n.type === 'fertilizer' ? '🌱' : '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {n.title}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  n.priority === 'HIGH'
                                    ? 'bg-rose-100 text-rose-700'
                                    : n.priority === 'MEDIUM'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {n.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      id="btn-view-all-notifications"
                      onClick={() => {
                        onOpenNotificationsPage();
                        setShowNotifDropdown(false);
                      }}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {language === 'te' ? 'అన్ని నోటిఫికేషన్లు చూడండి →' : 'View All Notifications & Alarm Settings →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Thank You & Session Summary Trigger */}
            <button
              id="btn-end-session"
              onClick={onOpenThankYou}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
              title="End Session & View Summary"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>{language === 'te' ? 'ధన్యవాదాలు' : 'Summary'}</span>
            </button>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-emerald-600 font-medium capitalize">{user.role}</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div 
                    id="dropdown-user-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full capitalize">
                        {user.role === 'admin' ? 'Agronomist / Admin' : 'Farmer'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenThankYou();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-800 hover:bg-amber-50 rounded-lg flex items-center space-x-2"
                    >
                      <HeartHandshake className="w-4 h-4 text-amber-600" />
                      <span>{t.endSession}</span>
                    </button>
                    <button
                      id="btn-logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-login-header"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                {t.login}
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
