import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { translations } from '../translations';
import { soundService } from '../services/sound';
import {
  Bell,
  CloudRain,
  Droplets,
  Sprout,
  Bug,
  CheckCircle2,
  Trash2,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Filter,
  CheckCheck
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  language: 'en' | 'te';
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  language,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  soundEnabled,
  onToggleSound
}) => {
  const t = translations[language];
  const [filterType, setFilterType] = useState<string>('all');
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        new Notification('AgriMind AI Alert System', {
          body: 'Push notifications are enabled for farm rain, disease, and irrigation warnings.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  const filtered = filterType === 'all'
    ? notifications
    : filterType === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filterType || n.priority === filterType.toUpperCase());

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Bell className="w-3.5 h-3.5 text-emerald-300" />
              <span>Multi-Channel Farm Alert Engine</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.notificationsAndAlerts}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'వర్షం, ఎరువులు, నీటిపారుదల మరియు తెగుళ్ల ముందస్తు హెచ్చరికలు.'
                : 'Automated weather alarms, smart drip alerts, pest notifications, and harvest reminders.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sound Test Button */}
            <button
              id="btn-test-sound"
              onClick={() => soundService.playEmergency()}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white flex items-center space-x-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Test Audio Siren</span>
            </button>

            {/* Mark all read */}
            <button
              id="btn-mark-all-read-page"
              onClick={onMarkAllRead}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{t.markAllAsRead}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Browser Notification Banner */}
      {permissionStatus !== 'granted' && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-sky-600 animate-pulse shrink-0" />
            <span>Enable browser push alerts to receive instant emergency farm warnings even when AgriMind is closed.</span>
          </div>
          <button
            onClick={requestPushPermission}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shrink-0 transition-colors"
          >
            Enable Push Alerts
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread Only' },
          { id: 'HIGH', label: '🔥 High Priority' },
          { id: 'rain', label: '🌧️ Weather & Rain' },
          { id: 'irrigation', label: '💧 Irrigation' },
          { id: 'disease', label: '🦠 Disease / Pest' },
          { id: 'fertilizer', label: '🌱 Fertilizer' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterType === tab.id
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No notifications matching this filter.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              id={`notif-card-${notif.id}`}
              className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                !notif.isRead
                  ? 'bg-white border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
                    {notif.type === 'rain' ? '🌧️' : notif.type === 'irrigation' ? '💧' : notif.type === 'disease' ? '🦠' : notif.type === 'fertilizer' ? '🌱' : '🔔'}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        notif.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : notif.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {notif.priority}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  {!notif.isRead && (
                    <button
                      onClick={() => onMarkRead(notif.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.markAsRead}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteNotification(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
