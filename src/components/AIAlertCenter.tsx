import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RefreshCw,
  Filter,
  Radio,
  Sparkles,
  Search,
  Bell,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AlertItem, AlertSeverity, AlertType } from '../types';
import { apiService } from '../services/api';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';

interface AIAlertCenterProps {
  language: 'en' | 'te';
  onAlertSelect?: (alert: AlertItem) => void;
  onOpenVoiceSettings?: () => void;
}

export const AIAlertCenter: React.FC<AIAlertCenterProps> = ({
  language,
  onAlertSelect,
  onOpenVoiceSettings
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingAlertId, setSpeakingAlertId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [evaluatingAgents, setEvaluatingAgents] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAlerts();
      if (res.success && Array.isArray(res.alerts)) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const unsubscribe = voiceService.subscribe((state) => {
      if (!state.isSpeaking) {
        setSpeakingAlertId(null);
        setIsPaused(false);
      } else {
        setIsPaused(state.isPaused);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiService.acknowledgeAlert(id);
      if (res.success) {
        soundService.playSuccess();
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : a));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiService.resolveAlert(id);
      if (res.success) {
        soundService.playSuccess();
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a));
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleSpeak = (alert: AlertItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (speakingAlertId === alert.id) {
      if (isPaused) {
        voiceService.resume();
      } else {
        voiceService.pause();
      }
      return;
    }

    setSpeakingAlertId(alert.id);
    const speechText = `${alert.severity === 'CRITICAL' ? 'Critical emergency alert.' : alert.severity === 'HIGH' ? 'High priority warning.' : 'Farm advisory.'} ${alert.title}. ${alert.message}. Recommended action: ${alert.recommended_action}`;
    
    voiceService.speak(speechText, {
      isCritical: alert.severity === 'CRITICAL',
      onEnd: () => setSpeakingAlertId(null),
      onError: () => setSpeakingAlertId(null)
    });
  };

  const handleStopSpeaking = (e: React.MouseEvent) => {
    e.stopPropagation();
    voiceService.stop();
    setSpeakingAlertId(null);
  };

  const handleTriggerSurveillance = async () => {
    try {
      setEvaluatingAgents(true);
      setEvalSuccessMsg(null);
      
      // Trigger decision orchestration
      const decisionRes = await apiService.getAgentDecision({
        message: "Run autonomous farm multi-agent risk surveillance and synthesize latest prioritized alerts.",
        context: { trigger: 'surveillance_scan' }
      });

      soundService.playChime();
      await fetchAlerts();
      setEvalSuccessMsg(language === 'te' ? 'మల్టీ-ఏజెంట్ విశ్లేషణ పూర్తయింది! కొత్త హెచ్చరికలు సమకాలీకరించబడ్డాయి.' : 'Multi-Agent Farm Surveillance completed! Alerts synchronized.');
      setTimeout(() => setEvalSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Surveillance scan failed:', err);
    } finally {
      setEvaluatingAgents(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'critical_high') {
      if (alert.severity !== 'CRITICAL' && alert.severity !== 'HIGH') return false;
    } else if (filterSeverity !== 'all' && alert.severity !== filterSeverity) {
      return false;
    }

    if (filterStatus === 'unacknowledged') {
      if (alert.status !== 'NEW' && alert.status !== 'SEEN') return false;
    } else if (filterStatus === 'resolved') {
      if (alert.status !== 'RESOLVED') return false;
    } else if (filterStatus === 'acknowledged') {
      if (alert.status !== 'ACKNOWLEDGED') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        alert.title.toLowerCase().includes(q) ||
        alert.message.toLowerCase().includes(q) ||
        alert.type.toLowerCase().includes(q) ||
        alert.recommended_action.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const highCount = alerts.filter(a => a.severity === 'HIGH' && a.status !== 'RESOLVED').length;
  const unreadCount = alerts.filter(a => (a.status === 'NEW' || a.status === 'SEEN')).length;

  return (
    <div id="ai-alert-center-root" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{language === 'te' ? '24/7 మల్టీ-ఏజెంట్ ఫార్మ్ సర్వైలెన్స్' : '24/7 Autonomous Multi-Agent Surveillance'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'te' ? 'ఏఐ హెచ్చరిక కేంద్రం & వాయిస్ డిస్పాచ్' : 'AI Alert Center & Voice Dispatch'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {language === 'te'
                ? 'వాతావరణం, నేల తేమ, చీడపీడలు, మార్కెట్ ధరల విశ్లేషణ ఆధారంగా స్వయంప్రతిపత్త ఏజెంట్లు రూపొందించిన ప్రాధాన్యతా హెచ్చరికలు.'
                : 'Prioritized farm risks synthesized by Weather, Soil, Disease, Pest, Irrigation, and Market Agents with speech dispatch and alarm triggers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenVoiceSettings && (
              <button
                id="btn-alert-center-voice-settings"
                onClick={onOpenVoiceSettings}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center space-x-2"
              >
                <Volume2 className="w-4 h-4 text-teal-300" />
                <span>{language === 'te' ? 'వాయిస్ సెట్టింగ్‌లు' : 'Voice & Sound Config'}</span>
              </button>
            )}

            <button
              id="btn-scan-farm-agents"
              onClick={handleTriggerSurveillance}
              disabled={evaluatingAgents}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg transition-all flex items-center space-x-2 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${evaluatingAgents ? 'animate-spin' : ''}`} />
              <span>{evaluatingAgents ? (language === 'te' ? 'విశ్లేషిస్తోంది...' : 'Evaluating Agents...') : (language === 'te' ? 'ఫార్మ్ స్కాన్ చేయండి' : 'Run Agent Risk Scan')}</span>
            </button>
          </div>
        </div>

        {evalSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{evalSuccessMsg}</span>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Critical Emergencies</div>
            <div className="text-xl font-extrabold text-rose-400 mt-0.5">{criticalCount}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">High Warnings</div>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{highCount}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Unacknowledged</div>
            <div className="text-xl font-extrabold text-teal-300 mt-0.5">{unreadCount}</div>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[11px] text-slate-400 font-medium">Total Alerts Monitored</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{alerts.length}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Severities' },
            { id: 'critical_high', label: '🚨 Critical & High' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HIGH', label: 'High' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'LOW', label: 'Low' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterSeverity(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterSeverity === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="unacknowledged">Unacknowledged (New/Seen)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40 sm:w-52"
            />
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <span>Synchronizing alerts with multi-agent system...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Alerts Match Criteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            All farm agents report parameters are operating within nominal thresholds.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => {
            const isSpeakingThis = speakingAlertId === alert.id;
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';
            const isMedium = alert.severity === 'MEDIUM';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                onClick={() => onAlertSelect && onAlertSelect(alert)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isCritical
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-400/30 hover:border-rose-400'
                    : isHigh
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30 hover:border-amber-400'
                    : isMedium
                    ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  
                  {/* Left content */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      isCritical ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' :
                      isHigh ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' :
                      isMedium ? 'bg-slate-700 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {isCritical ? <AlertOctagon className="w-6 h-6 animate-pulse" /> :
                       isHigh ? <AlertTriangle className="w-6 h-6" /> :
                       <Info className="w-6 h-6" />}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Severity Badge */}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          isCritical ? 'bg-rose-600 text-white' :
                          isHigh ? 'bg-amber-500 text-white' :
                          isMedium ? 'bg-slate-700 text-white' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {alert.severity}
                        </span>

                        {/* Agent Type */}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {alert.type} AGENT
                        </span>

                        {/* Status */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          alert.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {alert.status}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono flex items-center ml-auto">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {alert.title}
                      </h3>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Highlighted Recommendation Box */}
                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start space-x-2">
                        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-bold text-emerald-900">AI Recommendation: </span>
                          <span className="text-emerald-800">{alert.recommended_action}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pt-1">
                        <span>Confidence: <strong>{Math.round(alert.confidence * 100)}%</strong></span>
                        <span>•</span>
                        <span>Sound Alarm: <strong>{alert.sound}</strong></span>
                        <span>•</span>
                        <span>Voice Enabled: <strong>{alert.voice_required ? 'Yes' : 'No'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                    
                    {/* Speak Button */}
                    {!isSpeakingThis ? (
                      <button
                        onClick={(e) => handleSpeak(alert, e)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 hover:scale-105 active:scale-95"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>🔊 Speak Alert</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl">
                        <button
                          onClick={(e) => handleSpeak(alert, e)}
                          className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1"
                        >
                          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>
                        <button
                          onClick={handleStopSpeaking}
                          className="px-2 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-xs font-semibold flex items-center space-x-1"
                        >
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </button>
                      </div>
                    )}

                    {/* Test Alarm Sound Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundService.playAlarmForSeverity(alert.severity);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span>Test Alarm</span>
                    </button>

                    {/* Acknowledge Button */}
                    {alert.status !== 'ACKNOWLEDGED' && alert.status !== 'RESOLVED' && (
                      <button
                        onClick={(e) => handleAcknowledge(alert.id, e)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {/* Resolve Button */}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={(e) => handleResolve(alert.id, e)}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
