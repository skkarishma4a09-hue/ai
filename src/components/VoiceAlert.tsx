import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Bell,
  X,
  Radio,
  Sparkles
} from 'lucide-react';
import { AlertItem } from '../types';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';

interface VoiceAlertProps {
  alert: AlertItem | null;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onClose?: () => void;
  onViewDetails?: (alert: AlertItem) => void;
  autoPlayThreshold?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NONE';
}

export const VoiceAlert: React.FC<VoiceAlertProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onClose,
  onViewDetails,
  autoPlayThreshold = 'HIGH'
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasPlayedAlarm, setHasPlayedAlarm] = useState(false);
  const playedAlertIdRef = useRef<string | null>(null);

  // Subscribe to global voice state
  useEffect(() => {
    const unsubscribe = voiceService.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setIsPaused(state.isPaused);
    });
    return () => unsubscribe();
  }, []);

  // Handle new alert triggers
  useEffect(() => {
    if (!alert) return;

    if (playedAlertIdRef.current !== alert.id) {
      playedAlertIdRef.current = alert.id;
      setHasPlayedAlarm(false);
      setAutoplayBlocked(false);

      const isHighOrCritical = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';
      const shouldAutoplay =
        autoPlayThreshold === 'CRITICAL' ? alert.severity === 'CRITICAL' :
        autoPlayThreshold === 'HIGH' ? isHighOrCritical :
        autoPlayThreshold === 'MEDIUM' ? (isHighOrCritical || alert.severity === 'MEDIUM') : false;

      if (shouldAutoplay && alert.sound_required) {
        // Trigger sound alarm
        try {
          soundService.playAlarmForSeverity(alert.severity);
          setHasPlayedAlarm(true);
        } catch {
          setAutoplayBlocked(true);
        }

        // Trigger voice alert speech
        if (alert.voice_required) {
          const speechText = `${alert.severity === 'CRITICAL' ? 'Critical emergency alert.' : 'Farm priority alert.'} ${alert.title}. ${alert.message}. Recommended action: ${alert.recommended_action}`;
          const ok = voiceService.speak(speechText, {
            isCritical: alert.severity === 'CRITICAL',
            onError: () => setAutoplayBlocked(true)
          });
          if (!ok) {
            setAutoplayBlocked(true);
          }
        }
      }
    }
  }, [alert, autoPlayThreshold]);

  if (!alert) return null;

  const isCritical = alert.severity === 'CRITICAL';
  const isHigh = alert.severity === 'HIGH';
  const isMedium = alert.severity === 'MEDIUM';

  const handleSpeak = () => {
    setAutoplayBlocked(false);
    const speechText = `${isCritical ? 'Critical farm alert.' : isHigh ? 'High priority farm alert.' : 'Farm advisory.'} ${alert.title}. ${alert.message}. Recommendation: ${alert.recommended_action}`;
    voiceService.speak(speechText, { isCritical });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      voiceService.resume();
    } else {
      voiceService.pause();
    }
  };

  const handleStop = () => {
    voiceService.stop();
  };

  const handleToggleMute = () => {
    const newMuted = soundService.toggleMute();
    setIsMuted(newMuted);
    voiceService.saveSettings({
      voiceAlertsEnabled: !newMuted,
      alarmSoundsEnabled: !newMuted
    });
    if (newMuted) {
      voiceService.stop();
    }
  };

  const handlePlayAlarmOnly = () => {
    soundService.playAlarmForSeverity(alert.severity);
  };

  return (
    <div
      id="voice-alert-banner"
      className={`relative w-full rounded-2xl border shadow-lg transition-all overflow-hidden ${
        isCritical
          ? 'bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white border-rose-600 ring-2 ring-rose-500/50 animate-pulse-subtle'
          : isHigh
          ? 'bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 text-white border-amber-500 ring-1 ring-amber-400/40'
          : isMedium
          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-slate-700'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      {/* Top Banner Ticker */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold border-b ${
        isCritical ? 'bg-rose-950/80 border-rose-700/60 text-rose-200' :
        isHigh ? 'bg-amber-950/80 border-amber-700/60 text-amber-200' :
        'bg-slate-950/80 border-slate-700/60 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2">
          {isCritical ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          ) : (
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          )}
          <span className="uppercase tracking-wider">
            {isCritical ? '🚨 CRITICAL FARM EMERGENCY' : isHigh ? '⚠️ HIGH PRIORITY FARM ALERT' : '🔔 AI FARM ADVISORY'}
          </span>
          <span className="opacity-40">•</span>
          <span className="text-[11px] font-mono opacity-80">{alert.type} AGENT</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Unmute quick toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            title={isMuted ? 'Unmute voice & alarms' : 'Mute voice & alarms'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-300" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-300" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              title="Close banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5 flex-1">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {isCritical ? <AlertOctagon className="w-6 h-6 animate-bounce" /> :
               isHigh ? <AlertTriangle className="w-6 h-6" /> :
               <Info className="w-6 h-6" />}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  {alert.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/90">
                  Confidence: {Math.round(alert.confidence * 100)}%
                </span>
                {alert.status === 'ACKNOWLEDGED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Acknowledged
                  </span>
                )}
              </div>

              <p className="text-xs text-white/90 leading-relaxed max-w-3xl">
                {alert.message}
              </p>

              {/* Recommended Action Card */}
              <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/10 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300">Recommended Action: </span>
                  <span className="text-white/90">{alert.recommended_action}</span>
                </div>
              </div>

              {autoplayBlocked && (
                <p className="text-[11px] text-amber-300 font-medium pt-1 flex items-center">
                  <Volume2 className="w-3 h-3 mr-1 inline" /> Browser autoplay was blocked. Tap <strong>Listen</strong> below to hear the voice alert.
                </p>
              )}
            </div>
          </div>

          {/* Voice Playback & Action Controls */}
          <div className="flex flex-wrap sm:flex-nowrap md:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 md:pt-0">
            {/* Primary Voice TTS Listen Button */}
            {!isSpeaking ? (
              <button
                id="btn-voice-listen-alert"
                onClick={handleSpeak}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>🔊 LISTEN TO AI RECOMMENDATION</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/20">
                <button
                  onClick={handlePauseResume}
                  className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleStop}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-xs font-semibold flex items-center space-x-1"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            {/* Acknowledge & Action buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {onAcknowledge && alert.status !== 'ACKNOWLEDGED' && alert.status !== 'RESOLVED' && (
                <button
                  id="btn-voice-acknowledge-alert"
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACKNOWLEDGE</span>
                </button>
              )}

              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(alert)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
                >
                  VIEW DETAILS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
