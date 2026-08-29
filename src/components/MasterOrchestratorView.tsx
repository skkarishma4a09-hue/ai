import React, { useState } from 'react';
import { MasterAgentDecision, DashboardData } from '../types';
import { translations } from '../translations';
import { soundService } from '../services/sound';
import {
  Cpu,
  CloudSun,
  Droplets,
  Sprout,
  Eye,
  Bell,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Thermometer,
  Gauge,
  Send,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  AlertTriangle,
  FileText,
  Search,
  Check
} from 'lucide-react';

interface MasterOrchestratorViewProps {
  decision: MasterAgentDecision | null;
  dashboardData: DashboardData | null;
  language: 'en' | 'te';
  onExecuteAction: (actionId: string) => Promise<void>;
  onNavigateTab: (tabId: string) => void;
}

export const MasterOrchestratorView: React.FC<MasterOrchestratorViewProps> = ({
  decision,
  dashboardData,
  language,
  onExecuteAction,
  onNavigateTab
}) => {
  const t = translations[language];
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [executedActions, setExecutedActions] = useState<Record<string, boolean>>({});

  // Interactive Agent Decision State
  const [farmerQuery, setFarmerQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [customDecision, setCustomDecision] = useState<any>(null);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, 'helpful' | 'unhelpful'>>({});

  // Daily Plan State
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [loadingDailyPlan, setLoadingDailyPlan] = useState(false);

  const handleActionClick = async (actionId: string) => {
    setExecutingId(actionId);
    try {
      await onExecuteAction(actionId);
      setExecutedActions(prev => ({ ...prev, [actionId]: true }));
      soundService.playChime();
    } finally {
      setExecutingId(null);
    }
  };

  const handleFetchDailyPlan = async () => {
    setLoadingDailyPlan(true);
    try {
      soundService.playChime();
      const res = await fetch('/api/agent/daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_id: 'farm_001' })
      });
      const data = await res.json();
      if (data.success && data.daily_plan) {
        setDailyPlan(data.daily_plan);
      }
    } catch (e) {
      console.error('Failed to fetch daily plan:', e);
    } finally {
      setLoadingDailyPlan(false);
    }
  };

  const handleAskAgent = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const query = presetPrompt || farmerQuery;
    if (!query.trim()) return;

    setIsProcessing(true);
    setCustomDecision(null);
    setActiveStepIndex(0);
    soundService.playChime();

    // Stage progression animation
    const stepTimer1 = setTimeout(() => setActiveStepIndex(1), 350);
    const stepTimer2 = setTimeout(() => setActiveStepIndex(2), 700);
    const stepTimer3 = setTimeout(() => setActiveStepIndex(3), 1100);
    const stepTimer4 = setTimeout(() => setActiveStepIndex(4), 1500);

    try {
      const res = await fetch('/api/agent/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          farm_id: 'farm_001',
          context: {
            cropName: dashboardData?.crop?.name || 'Tomato',
            soilMoisture: dashboardData?.soil?.moisturePercent || 38,
            nitrogen: dashboardData?.soil?.nitrogen || 180,
            potassium: dashboardData?.soil?.potassium || 160
          }
        })
      });
      const result = await res.json();
      if (result.success && result.agent) {
        setActiveStepIndex(5);
        setCustomDecision(result.agent);
      }
    } catch (err) {
      console.error('Agent query error:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
      setIsProcessing(false);
    }
  };

  const handleFeedback = async (decisionId: string, helpful: boolean) => {
    setFeedbackSent(prev => ({ ...prev, [decisionId]: helpful ? 'helpful' : 'unhelpful' }));
    soundService.playChime();
    try {
      await fetch('/api/agent/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision_id: decisionId,
          rating: helpful ? 5 : 1,
          helpful,
          feedback_text: helpful ? 'Farmer found recommendation accurate' : 'Farmer reported adjustment needed'
        })
      });
    } catch (err) {
      console.warn('Feedback save error:', err);
    }
  };

  const weather = dashboardData?.weather;
  const soil = dashboardData?.soil;
  const crop = dashboardData?.crop;

  const agentWorkflowSteps = [
    { label: 'Understanding Farmer Intent', icon: HelpCircle },
    { label: 'Farm Telemetry & Memory Sync', icon: Layers },
    { label: 'Dynamic Agent & Tool Selection', icon: Cpu },
    { label: 'Executing Allowlisted Tools', icon: Zap },
    { label: 'Conflict Detection & Risk Engine', icon: AlertOctagon },
    { label: 'Decision & Action Plan Synthesis', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Master AI Autonomous Status Banner */}
      <div 
        id="card-master-ai-orchestration"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20"
      >
        {/* Glow & Mesh Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Multi-Agent Agentic AI Orchestrator</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Outfit']">
              AgriMind AI Decision Center
            </h1>
            
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Autonomous multi-agent system coordinating Weather, Soil, Pathology, Irrigation, Fertilizer, and Market intelligence with dynamic conflict resolution.
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                id="btn-daily-plan"
                onClick={handleFetchDailyPlan}
                disabled={loadingDailyPlan}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 text-emerald-200" />
                <span>{loadingDailyPlan ? 'Synthesizing Daily Plan...' : 'What Should I Do Today? (1-Click Plan)'}</span>
              </button>
            </div>
          </div>

          {/* Master Health & Autonomy Score Gauge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4.5 min-w-[240px] text-center shrink-0">
            <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-emerald-300 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>AI Crop Health Status</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-['Outfit'] my-1">
              {decision?.overallHealthScore || 82}%
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {decision?.status || 'Active Monitoring'}
            </div>
            <p className="text-[10px] text-slate-300 mt-2">
              10 Specialized Agents Online
            </p>
          </div>
        </div>

        {/* 2. Specialized AI Sub-Agent Architecture Grid */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Weather AI */}
          <button 
            id="agent-card-weather"
            onClick={() => onNavigateTab('weather')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <CloudSun className="w-5 h-5 text-sky-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs font-bold text-white">Weather Agent</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              {weather ? `${weather.temperature}°C • ${weather.rainProbability}% Rain` : 'Live Synced'}
            </p>
          </button>

          {/* Soil AI */}
          <button 
            id="agent-card-soil"
            onClick={() => onNavigateTab('soil')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Layers className="w-5 h-5 text-amber-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">Soil Agent</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              {soil ? `Moisture: ${soil.moisturePercent}% • pH ${soil.ph}` : 'Active'}
            </p>
          </button>

          {/* Vision AI */}
          <button 
            id="agent-card-vision"
            onClick={() => onNavigateTab('vision')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">Disease Vision AI</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              Pathology Engine
            </p>
          </button>

          {/* Irrigation AI */}
          <button 
            id="agent-card-irrigation"
            onClick={() => onNavigateTab('weather')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">Irrigation Agent</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              ET₀ {weather?.et0 || 4.8}mm/day
            </p>
          </button>

          {/* Fertilizer AI */}
          <button 
            id="agent-card-fertilizer"
            onClick={() => onNavigateTab('soil')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <Sprout className="w-5 h-5 text-lime-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">Fertilizer Agent</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              NPK Balanced
            </p>
          </button>

          {/* Market & Profit AI */}
          <button 
            id="agent-card-market"
            onClick={() => onNavigateTab('market')}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-white">Market Agent</p>
            <p className="text-[10px] text-emerald-200 mt-0.5 truncate">
              APMC Mandi Surging
            </p>
          </button>

        </div>
      </div>

      {/* 2. Interactive Multi-Agent Question Center */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ask the AI Farm Manager
              </h2>
              <p className="text-xs text-slate-500">
                Dynamic tool selection, conflict resolution, risk scoring & actionable advice
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAskAgent} className="relative">
          <input
            type="text"
            value={farmerQuery}
            onChange={e => setFarmerQuery(e.target.value)}
            placeholder="e.g. My tomato leaves are turning yellow. Should I irrigate and apply fertilizer?"
            className="w-full pl-4 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={isProcessing || !farmerQuery.trim()}
            className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Analyzing...' : 'Ask AI'}</span>
          </button>
        </form>

        {/* Quick Question Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 py-1">Quick prompts:</span>
          {[
            'My tomato leaves are yellow. Should I water and fertilize?',
            'Will upcoming rain cancel today’s scheduled drip irrigation?',
            'What is the optimal potassium fertigation dose for Arka Rakshak F1?',
            'What is the expected yield and net profit for my 2-acre tomato crop?'
          ].map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFarmerQuery(promptText);
                handleAskAgent(undefined, promptText);
              }}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 rounded-lg transition-all text-left"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Live Processing Pipeline Status */}
        {isProcessing && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800">
              <Cpu className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Multi-Agent System Orchestrating Decision...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {agentWorkflowSteps.map((step, idx) => {
                const isPassed = activeStepIndex > idx;
                const isCurrent = activeStepIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-[11px] flex items-center space-x-2 ${
                      isPassed
                        ? 'bg-white text-emerald-800 border-emerald-300 font-semibold'
                        : isCurrent
                        ? 'bg-emerald-100/90 text-emerald-900 border-emerald-400 font-bold animate-pulse'
                        : 'bg-white/50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <step.icon className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Synthesized Decision Result Display */}
        {customDecision && (
          <div className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/30 space-y-4 shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 uppercase tracking-wider">
                  Intent: {customDecision.intent?.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-300">
                  Confidence: <b>{Math.round((customDecision.confidence_score || 0.92) * 100)}%</b> ({customDecision.confidence_level?.toUpperCase()})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-300">Tools:</span>
                <div className="flex flex-wrap gap-1">
                  {(customDecision.tools_used || ['crop', 'soil', 'weather', 'irrigation']).map((tool: string) => (
                    <span key={tool} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-emerald-200">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolved Conflicts Notice */}
            {customDecision.conflicts && customDecision.conflicts.length > 0 && (
              <div className="p-3 bg-amber-500/15 border border-amber-400/30 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agent Conflict Detected & Resolved:</span>
                </div>
                {customDecision.conflicts.map((conf: any, ci: number) => (
                  <p key={ci} className="text-xs text-amber-100/90 leading-relaxed">
                    <b>{conf.title}</b>: {conf.resolution}
                  </p>
                ))}
              </div>
            )}

            {/* Primary Recommendation */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                Final Autonomous Recommendation:
              </div>
              <div className="text-base font-bold text-white leading-snug">
                {customDecision.recommendation}
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed pt-1">
                {customDecision.reasoning_summary}
              </p>
            </div>

            {/* Action Steps */}
            {customDecision.actions && customDecision.actions.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="text-xs font-bold text-slate-300">Action Steps:</div>
                <div className="space-y-1.5">
                  {customDecision.actions.map((act: string, ai: number) => (
                    <div key={ai} className="flex items-start space-x-2 text-xs text-slate-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Collector */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-slate-300">
              <span>Was this AI recommendation helpful?</span>
              <div className="flex items-center space-x-2">
                {feedbackSent[customDecision.id] ? (
                  <span className="text-[11px] font-bold text-emerald-400">
                    ✓ Feedback logged to Farm Memory
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleFeedback(customDecision.id || 'dec_latest', true)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-emerald-600 rounded-lg flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Helpful</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(customDecision.id || 'dec_latest', false)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-rose-600 rounded-lg flex items-center space-x-1 text-xs font-semibold cursor-pointer transition-all"
                    >
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      <span>Not Helpful</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Daily 3-Horizon Plan View (When Requested) */}
      {dailyPlan && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daily Autonomous Action Plan (Today • Tomorrow • This Week)
                </h2>
                <p className="text-xs text-slate-500">
                  {dailyPlan.farm_name} • {dailyPlan.crop_name} ({dailyPlan.growth_stage} stage)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Confidence: {Math.round((dailyPlan.confidence_score || 0.94) * 100)}%
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium">
            💡 <b>Primary Strategy:</b> {dailyPlan.primary_recommendation}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Today */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-xs text-emerald-800 uppercase tracking-wider">
                <span>🗓️ Today</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">High Focus</span>
              </div>
              <div className="space-y-2">
                {dailyPlan.horizons?.today?.map((item: any) => (
                  <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tomorrow */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-xs text-sky-800 uppercase tracking-wider">
                <span>⏳ Tomorrow</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">Follow-Up</span>
              </div>
              <div className="space-y-2">
                {dailyPlan.horizons?.tomorrow?.map((item: any) => (
                  <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* This Week */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-xs text-indigo-800 uppercase tracking-wider">
                <span>📅 This Week</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">Strategic</span>
              </div>
              <div className="space-y-2">
                {dailyPlan.horizons?.this_week?.map((item: any) => (
                  <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-1">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Real-Time Multi-Sensor Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Soil Moisture */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.soilMoisture}</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {soil?.moisturePercent || 38}%
            </span>
            <span className="text-[11px] text-amber-600 font-semibold">Low (Target: 45-65%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${soil?.moisturePercent || 38}%` }}
            />
          </div>
        </div>

        {/* Temperature & Humidity */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.temperature} / {t.humidity}</span>
            <Thermometer className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {weather?.temperature || 30.5}°C
            </span>
            <span className="text-xs text-slate-500">
              {weather?.humidity || 65}% RH
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-2">
            ⛅ {weather?.condition || 'Partly Cloudy'}
          </p>
        </div>

        {/* Soil pH */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.soilPh}</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 font-['Outfit']">
              {soil?.ph || 6.8}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Ideal root nutrient intake
          </p>
        </div>

        {/* NPK Ratio Status */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">NPK Levels (mg/kg)</span>
            <Sprout className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-xl font-bold text-slate-900 font-['Outfit']">
              {soil?.nitrogen || 180} : {soil?.phosphorus || 24} : {soil?.potassium || 160}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-2">
            K top-dressing needed
          </p>
        </div>

      </div>

      {/* 5. Autonomous Action Plan Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.masterActionPlan}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te' 
                  ? 'AI ఏజెంట్లు నిర్ణయించిన ప్రాధాన్యతా పనులు (రైతు అనుమతితో అమలవుతాయి)' 
                  : 'Synthesized prioritized actions ready for execution'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {decision?.autonomousActionPlan?.length || 0} Pending Decisions
          </span>
        </div>

        {/* Action Items List */}
        <div className="space-y-3 pt-2">
          {(!decision?.autonomousActionPlan || decision.autonomousActionPlan.length === 0) ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-xs">
              All farm systems are operating in optimal status. No urgent action required.
            </div>
          ) : (
            decision.autonomousActionPlan.map((action) => {
              const isExecuted = executedActions[action.id] || action.executed;
              return (
                <div
                  key={action.id}
                  id={`action-plan-item-${action.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    isExecuted
                      ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                      : action.priority === 'HIGH'
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                      : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300 hover:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          action.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {action.priority} Priority
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          🤖 {action.agent}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {action.scheduledWindow}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {action.actionTitle}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {action.description}
                      </p>

                      <div className="pt-1 flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Benefit: {action.estimatedBenefit}</span>
                      </div>
                    </div>

                    {/* Action Execution Button */}
                    <div className="shrink-0">
                      {isExecuted ? (
                        <div className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Approved & Executed</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-execute-action-${action.id}`}
                          onClick={() => handleActionClick(action.id)}
                          disabled={executingId === action.id}
                          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            {executingId === action.id ? 'Executing...' : 'Approve & Execute'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Autonomous Multi-Agent Synthesis Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Weather & Irrigation Synthesis */}
        <div className="p-5 bg-gradient-to-br from-sky-50 to-white rounded-3xl border border-sky-100 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-sky-800 font-bold text-sm">
            <CloudSun className="w-4 h-4 text-sky-600" />
            <span>Weather & Irrigation Synthesis</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {decision?.keyInsights?.weatherInsight} {decision?.keyInsights?.irrigationInsight}
          </p>
          <button
            onClick={() => onNavigateTab('weather')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center cursor-pointer"
          >
            Open Smart Irrigation Engine <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

        {/* Soil & Nutrient Synthesis */}
        <div className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-100 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Soil Health & Crop Nutrition Synthesis</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {decision?.keyInsights?.soilInsight} {decision?.keyInsights?.nutrientInsight}
          </p>
          <button
            onClick={() => onNavigateTab('soil')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center cursor-pointer"
          >
            Open Soil & Fertilizer Advisor <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>

      </div>

    </div>
  );
};

