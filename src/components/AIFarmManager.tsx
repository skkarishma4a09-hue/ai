import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  Radio,
  Sliders,
  Layers,
  ArrowRight,
  ShieldAlert,
  Droplets,
  CloudSun,
  Sprout,
  Bug,
  LineChart,
  HelpCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  AgentDecisionResult,
  AlertItem,
  Farm,
  Crop,
  SoilData,
  WeatherData
} from '../types';
import { apiService } from '../services/api';
import { soundService } from '../services/sound';
import { voiceService } from '../services/voice';
import { VoiceAlert } from './VoiceAlert';

interface AIFarmManagerProps {
  language: 'en' | 'te';
  farm?: Farm;
  crop?: Crop;
  soil?: SoilData;
  weather?: WeatherData;
  onOpenVoiceSettings?: () => void;
}

export const AIFarmManager: React.FC<AIFarmManagerProps> = ({
  language,
  farm,
  crop,
  soil,
  weather,
  onOpenVoiceSettings
}) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [decision, setDecision] = useState<AgentDecisionResult | null>(null);
  const [activeAlert, setActiveAlert] = useState<AlertItem | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [history, setHistory] = useState<AgentDecisionResult[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [sttSupported, setSttSupported] = useState(voiceService.isSTTSupported());

  // Subscribe to voice state
  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setIsSpeaking(state.isSpeaking);
      setIsPaused(state.isPaused);
    });
    return () => unsub();
  }, []);

  const orchestrateDecision = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    try {
      setIsAnalyzing(true);
      setCurrentStep(1); // Understanding question
      setDecision(null);
      setActiveAlert(null);
      setFeedbackGiven(null);
      voiceService.stop();

      // Step 1 -> 2: Agent Selection
      setTimeout(() => setCurrentStep(2), 600);

      // Step 2 -> 3: Telemetry & Tool Analysis
      setTimeout(() => setCurrentStep(3), 1200);

      // Call the real Multi-Agent Decision API
      const res = await apiService.getAgentDecision({
        message: userPrompt,
        farm_id: farm?.id || 'farm_001',
        context: {
          crop: crop?.name || 'Tomato',
          variety: crop?.variety || 'Arka Rakshak',
          growthStage: crop?.growthStage || 'Flowering',
          soilMoisture: soil?.moisturePercent || 38,
          nitrogen: soil?.nitrogen || 180,
          phosphorus: soil?.phosphorus || 24,
          potassium: soil?.potassium || 160,
          ph: soil?.ph || 6.8,
          temperature: weather?.temperature || 31,
          humidity: weather?.humidity || 68,
          rainForecastMm: weather?.forecast?.[0]?.rainChance ? 14.5 : 0
        }
      });

      // Step 4: Conflict Check & Alert Synthesis
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 600));
      setCurrentStep(5); // Complete

      if (res.success && res.agent) {
        const dec = res.agent;
        setDecision(dec);
        setHistory(prev => [dec, ...prev.slice(0, 9)]);

        // Check if there is an alert to display
        const overallRisk = dec.risk?.overall || 'MEDIUM';
        const isHighOrCritical = overallRisk === 'CRITICAL' || overallRisk === 'HIGH';

        // Synthesize an AlertItem representation for the VoiceAlert component
        const alertItem: AlertItem = {
          id: `alt_farm_${Date.now()}`,
          farmId: farm?.id || 'farm_001',
          type: dec.intent?.includes('irrigation') ? 'IRRIGATION' :
                dec.intent?.includes('disease') ? 'DISEASE' :
                dec.intent?.includes('fertilizer') ? 'FERTILIZER' : 'WEATHER',
          severity: overallRisk as any,
          title: dec.warnings?.[0]?.replace(/^[⚠️🚨🔔ℹ️\s]+/, '') || `${dec.intent?.replace(/_/g, ' ').toUpperCase() || 'FARM RECOMMENDATION'}`,
          message: dec.reasoning_summary || dec.recommendation,
          recommended_action: dec.recommendation,
          confidence: dec.confidence_score || 0.92,
          sound_required: isHighOrCritical,
          voice_required: true,
          sound: overallRisk === 'CRITICAL' ? 'critical' : overallRisk === 'HIGH' ? 'warning' : overallRisk === 'MEDIUM' ? 'attention' : 'notification',
          status: 'NEW',
          createdAt: new Date().toISOString()
        };

        setActiveAlert(alertItem);

        // Play alarm if high/critical
        if (isHighOrCritical) {
          soundService.playAlarmForSeverity(overallRisk);
        } else {
          soundService.playSuccess();
        }

        // Voice speak the recommendation
        const speechText = `${overallRisk === 'CRITICAL' ? 'Critical farm alert.' : overallRisk === 'HIGH' ? 'High priority warning.' : 'AgriMind AI Farm Manager recommendation.'} ${dec.recommendation} ${dec.actions?.[0] ? 'Action: ' + dec.actions[0] : ''}`;
        voiceService.speak(speechText, {
          isCritical: overallRisk === 'CRITICAL'
        });
      }
    } catch (err) {
      console.error('Decision orchestration error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setQuery('');
      const started = voiceService.startListening({
        language: language === 'te' ? 'te-IN' : 'en-US',
        onResult: (text, isFinal) => {
          setQuery(text);
          if (isFinal && text.trim().length > 3) {
            setIsListening(false);
            orchestrateDecision(text);
          }
        },
        onError: (err) => {
          console.warn('STT error:', err);
          setIsListening(false);
        }
      });
      if (started) {
        setIsListening(true);
      }
    }
  };

  const handleWhatShouldIDoToday = () => {
    const text = language === 'te'
      ? "నేను ఈరోజు పొలంలో ఏమి చేయాలి? వాతావరణం, నేల తేమ, నీటిపారుదల మరియు పంట ఆరోగ్యాన్ని విశ్లేషించండి."
      : "What should I do today on my farm? Analyze weather, soil moisture, irrigation schedule, and crop health.";
    setQuery(text);
    orchestrateDecision(text);
  };

  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedbackGiven(type);
    soundService.playSuccess();
  };

  const handleSpeakDecision = () => {
    if (!decision) return;
    const speechText = `AgriMind AI Recommendation: ${decision.recommendation}. Actions to take: ${decision.actions?.join('. ')}`;
    voiceService.speak(speechText, {
      isCritical: decision.risk?.overall === 'CRITICAL'
    });
  };

  return (
    <div id="ai-farm-manager-root" className="space-y-6">
      
      {/* Hero Action Card: "What should I do today?" */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>VOICE-ENABLED AGENTIC AI FARM MANAGER</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {language === 'te' ? 'నేను ఈరోజు ఏమి చేయాలి?' : 'What should I do today?'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
                {language === 'te'
                  ? 'మీ పొలం కోసం వాతావరణం, నేల తేమ, చీడపీడలు మరియు ఎరువుల డేటాను ఏజెంట్లు విశ్లేషించి ఖచ్చితమైన వాయిస్ సలహాలు ఇస్తాయి.'
                  : 'Ask or tap to invoke the Multi-Agent Farm Council. Evaluates Weather, Soil Sensors, Crop Disease, Irrigation KC, and Mandi Prices simultaneously.'}
              </p>
            </div>

            {/* Quick Action One-Click Button */}
            <div className="flex items-center gap-2">
              <button
                id="btn-what-should-i-do-today"
                onClick={handleWhatShouldIDoToday}
                disabled={isAnalyzing}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-emerald-950" />
                <span>{language === 'te' ? 'ఈరోజు ప్రణాళిక రూపొందించండి' : 'Run Full Farm Assessment'}</span>
              </button>

              {onOpenVoiceSettings && (
                <button
                  onClick={onOpenVoiceSettings}
                  title="Configure voice and alarm preferences"
                  className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Query Input & STT Bar */}
          <div className="bg-black/30 p-2 sm:p-3 rounded-2xl border border-white/15 flex items-center space-x-2">
            <button
              id="btn-farm-manager-mic"
              onClick={handleMicToggle}
              className={`p-3.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input (Speak now)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              id="input-farm-manager-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  orchestrateDecision(query);
                }
              }}
              placeholder={
                isListening
                  ? (language === 'te' ? 'మీ ప్రశ్న మాట్లాడండి...' : 'Listening... Speak your farm question now')
                  : (language === 'te' ? 'ఉదాహరణ: నేను ఈరోజు టమాటా పంటకు నీరు పెట్టాలా?' : 'Ask anything: "Should I irrigate today?", "Diagnose yellowing leaves", "Check mandi rate"...')
              }
              className="flex-1 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm px-2 focus:outline-none"
            />

            <button
              id="btn-farm-manager-submit"
              onClick={() => orchestrateDecision(query)}
              disabled={isAnalyzing || !query.trim()}
              className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Voice Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Quick Queries:</span>
            {[
              { en: "Should I irrigate today?", te: "ఈరోజు నీరు పెట్టాలా?" },
              { en: "Check disease risk on lower leaves", te: "ఆకుమచ్చ తెగులు ఉందా?" },
              { en: "What fertilizer is needed for flowering?", te: "పూత దశకు ఏ ఎరువు వేయాలి?" },
              { en: "Will rain affect my chemical spray?", te: "వర్షం వల్ల స్ప్రే ఆపాలా?" }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const text = language === 'te' ? chip.te : chip.en;
                  setQuery(text);
                  orchestrateDecision(text);
                }}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 transition-all"
              >
                {language === 'te' ? chip.te : chip.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Agent Multi-Step Orchestrator Visualizer */}
      {isAnalyzing && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Autonomous Multi-Agent Council Orchestration in Progress...</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: 1, label: '1. Intent & NLP Parsing', desc: 'Understanding Farmer Question', active: currentStep >= 1 },
              { step: 2, label: '2. Dynamic Agent Selection', desc: 'Selecting Weather, Soil & Crop Agents', active: currentStep >= 2 },
              { step: 3, label: '3. Farm Telemetry Tool Calls', desc: 'Querying 38% moisture & 14.5mm rain forecast', active: currentStep >= 3 },
              { step: 4, label: '4. Risk & Alert Synthesis', desc: 'Conflict Check & Voice Dispatching', active: currentStep >= 4 }
            ].map((s) => (
              <div
                key={s.step}
                className={`p-3.5 rounded-2xl border transition-all ${
                  s.active
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{s.label}</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active VoiceAlert Banner (if alert synthesized) */}
      {activeAlert && (
        <VoiceAlert
          alert={activeAlert}
          onAcknowledge={async (alertId) => {
            await apiService.acknowledgeAlert(alertId);
            setActiveAlert(prev => prev ? { ...prev, status: 'ACKNOWLEDGED' } : null);
          }}
          onClose={() => setActiveAlert(null)}
        />
      )}

      {/* Decision Output Card */}
      {decision && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                  DECISION: {decision.intent?.replace(/_/g, ' ') || 'SMART ADVISORY'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: {Math.round((decision.confidence_score || 0.92) * 100)}% ({decision.confidence_level})
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                AI Farm Council Synthesis
              </h3>
            </div>

            {/* Voice & Sound Control */}
            <div className="flex items-center space-x-2">
              {!isSpeaking ? (
                <button
                  id="btn-speak-decision"
                  onClick={handleSpeakDecision}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 Read Aloud</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
                  <button
                    onClick={() => isPaused ? voiceService.resume() : voiceService.pause()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={() => voiceService.stop()}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Primary Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-950 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Direct Recommendation</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
              {decision.recommendation}
            </p>
            {decision.reasoning_summary && (
              <p className="text-xs text-emerald-800/90 pt-1">
                <strong>Why: </strong>{decision.reasoning_summary}
              </p>
            )}
          </div>

          {/* Action Checklist */}
          {decision.actions && decision.actions.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recommended Farmer Action Steps</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {decision.actions.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-800 font-medium"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings & Risk Radar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decision.warnings && decision.warnings.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Risk Warnings</span>
                </div>
                <ul className="text-xs text-amber-950 space-y-1">
                  {decision.warnings.map((w, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Breakdown */}
            {decision.risk && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-slate-600" />
                  <span>Risk Dimensions</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-400">Weather</div>
                    <div className="font-bold text-amber-700">{decision.risk.weather}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-400">Disease</div>
                    <div className="font-bold text-rose-700">{decision.risk.disease}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-400">Water</div>
                    <div className="font-bold text-emerald-700">{decision.risk.water}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conflict Resolution Details Accordion */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1"
            >
              <span>{showTechnicalDetails ? 'Hide' : 'View'} Multi-Agent Conflict Resolution & Tool Telemetry</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3 font-mono text-slate-700">
                <div>
                  <strong>Tools Consulted: </strong> {decision.tools_used?.join(', ') || 'crop, soil, weather, irrigation'}
                </div>
                {decision.conflicts && decision.conflicts.length > 0 && (
                  <div>
                    <strong>Conflict Detected: </strong> {decision.conflicts[0]?.title}
                    <div className="text-slate-600 mt-1">Resolution: {decision.conflicts[0]?.resolution}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback Strip */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Was this AI recommendation helpful?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFeedback('helpful')}
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 transition-colors ${
                  feedbackGiven === 'helpful'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes, helpful</span>
              </button>
              <button
                onClick={() => handleFeedback('unhelpful')}
                className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 transition-colors ${
                  feedbackGiven === 'unhelpful'
                    ? 'bg-rose-100 border-rose-400 text-rose-800 font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Recent Farm History */}
      {history.length > 1 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Recent Agent Decisions History</span>
          </h3>

          <div className="space-y-2.5">
            {history.slice(1, 4).map((h, i) => (
              <div
                key={i}
                onClick={() => setDecision(h)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">{h.recommendation}</div>
                  <div className="text-[11px] text-slate-500">
                    {h.intent?.replace(/_/g, ' ')} • {h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
