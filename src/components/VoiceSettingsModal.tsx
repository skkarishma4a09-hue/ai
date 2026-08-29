import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Check,
  X,
  Play,
  Bell,
  AlertTriangle,
  AlertOctagon,
  Languages,
  Gauge
} from 'lucide-react';
import { voiceService, VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../services/voice';
import { soundService } from '../services/sound';
import { apiService } from '../services/api';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceService.getSettings());
  const [testPlaying, setTestPlaying] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(voiceService.getSettings());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (patch: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    voiceService.saveSettings(patch);
    soundService.setMuted(!updated.alarmSoundsEnabled);
    soundService.setVolume(updated.volume);
    apiService.updateAlertPreferences(patch).catch(() => {});
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestSound = (type: 'notification' | 'attention' | 'warning' | 'critical' | 'success') => {
    setTestPlaying(type);
    soundService.playAlarmForSeverity(type.toUpperCase());
    setTimeout(() => setTestPlaying(null), 1000);
  };

  const handleTestSpeech = () => {
    setTestPlaying('speech');
    const demoPhrases = {
      en: "This is a test of AgriMind Autonomous Voice alerts. Drip irrigation is currently optimized for your tomato crop.",
      te: "ఇది అగ్రిమైండ్ వాయిస్ అలర్ట్ పరీక్ష. మీ టమాటా పంటకు డ్రిప్ ఇరిగేషన్ సరైన స్థితిలో ఉంది.",
      hi: "यह एग्रीमाइंड वॉयस अलर्ट का परीक्षण है। आपकी टमाटर की फसल के लिए ड्रिप सिंचाई अनुकूलित है।"
    };
    const text = demoPhrases[settings.language] || demoPhrases.en;
    voiceService.speak(text, {
      language: settings.language,
      onEnd: () => setTestPlaying(null),
      onError: () => setTestPlaying(null)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/15 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Voice & Alarm Settings</h2>
              <p className="text-xs text-emerald-100/80">Configure autonomous AI speech and emergency sirens</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Toggles */}
          <div className="space-y-3">
            
            {/* Voice Alerts Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-3">
                <Volume2 className={`w-5 h-5 ${settings.voiceAlertsEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Voice Alerts (AI Text-To-Speech)</div>
                  <div className="text-[11px] text-slate-500">Speak recommendations and alerts aloud</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceAlertsEnabled}
                  onChange={(e) => handleChange({ voiceAlertsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Alarm Sounds Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-3">
                <Bell className={`w-5 h-5 ${settings.alarmSoundsEnabled ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold text-slate-900">Alarm Sounds</div>
                  <div className="text-[11px] text-slate-500">Play notification chimes and warning sirens</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alarmSoundsEnabled}
                  onChange={(e) => handleChange({ alarmSoundsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Critical Alerts Always On */}
            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <div>
                  <div className="text-xs font-bold text-rose-950">Critical Alerts</div>
                  <div className="text-[11px] text-rose-700">Override mute for extreme weather & emergencies</div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
                ALWAYS ON
              </span>
            </div>

          </div>

          {/* Voice Language Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Languages className="w-4 h-4 text-emerald-600" />
              <span>Voice Language</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English', sub: 'Default' },
                { code: 'te', label: 'తెలుగు (Telugu)', sub: 'Local' },
                { code: 'hi', label: 'हिन्दी (Hindi)', sub: 'National' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleChange({ language: lang.code as any })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    settings.language === lang.code
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">{lang.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{lang.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Gauge className="w-4 h-4 text-emerald-600" />
              <span>Speech Rate (Speed)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { speed: 'slow', label: 'Slow (0.8x)' },
                { speed: 'normal', label: 'Normal (1.0x)' },
                { speed: 'fast', label: 'Fast (1.25x)' }
              ].map((s) => (
                <button
                  key={s.speed}
                  onClick={() => handleChange({ speed: s.speed as any })}
                  className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                    settings.speed === s.speed
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Volume Level</span>
              </span>
              <span className="font-mono text-emerald-700">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={(e) => handleChange({ volume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Sound & Speech Testing Matrix */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="text-xs font-bold text-slate-900">Sound & Alarm Audio Test</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTestSound('notification')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1"
              >
                <span>🔔 Low Chime</span>
              </button>
              <button
                onClick={() => handleTestSound('attention')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-800 flex items-center justify-center space-x-1"
              >
                <span>⚠️ Attention</span>
              </button>
              <button
                onClick={() => handleTestSound('warning')}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[11px] font-semibold text-orange-800 flex items-center justify-center space-x-1"
              >
                <span>🚨 High Warning</span>
              </button>
              <button
                onClick={() => handleTestSound('critical')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold text-rose-800 flex items-center justify-center space-x-1"
              >
                <span>🚨 Critical Siren</span>
              </button>
              <button
                onClick={() => handleTestSound('success')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 flex items-center justify-center space-x-1"
              >
                <span>✅ Success Tone</span>
              </button>
              <button
                onClick={handleTestSpeech}
                className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[11px] font-bold text-teal-800 flex items-center justify-center space-x-1"
              >
                <Play className="w-3 h-3 text-teal-600" />
                <span>🔊 Test Speech</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            {isSaved && (
              <span className="text-emerald-600 font-bold flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Settings saved!
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
