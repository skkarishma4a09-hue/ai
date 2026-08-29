import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  X,
  RefreshCw,
  Sprout,
  HelpCircle,
  Volume2
} from 'lucide-react';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'te';
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: language === 'te'
        ? 'నమస్కారం రైతు సోదరా! నేను AgriMind AI వ్యవసాయ సహాయకుడిని. టమాటా, పత్తి, మిరప లేదా వరి పంటల నిర్వహణ, తెగుళ్లు, ఎరువులు లేదా నేల పరీక్ష గురించి ఏదైనా అడగండి.'
        : 'Namaste Farmer! I am AgriMind AI Assistant. How can I help you with crop health, precision drip irrigation, NPK fertilization, or mandi prices today?',
      language,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickChips = language === 'te' ? [
    'టమాటా ఆకుమచ్చ తెగులు నివారణ?',
    'పూత దశలో ఏ ఎరువులు వాడాలి?',
    'నేల తేమ 38% ఉంది, నీరు పెట్టాలా?',
    'గుంటూరు మార్కెట్ టమాటా ధర ఎంత?'
  ] : [
    'How to treat Tomato Early Blight?',
    'Best fertilizer for flowering stage?',
    'Soil moisture is 38%, should I irrigate?',
    'What is today\'s Tomato Mandi rate?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query,
      language,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      const response = await apiService.sendMessage(query, language);
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: language === 'te'
            ? 'క్షమించండి, సమాచారం పొందడంలో అంతరాయం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : 'Sorry, I encountered a temporary connection issue. Please try again.',
          language,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-emerald-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-bold text-sm font-['Outfit']">AgriMind AI Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-emerald-200">
              {language === 'te' ? 'తెలుగు & ఇంగ్లీష్ వ్యవసాయ సలహాదారు' : 'Bilingual Indian Agronomist AI'}
            </p>
          </div>
        </div>

        <button
          id="btn-close-chatbot"
          onClick={onClose}
          className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 bg-white border border-emerald-300 hover:border-emerald-500 rounded-full text-[11px] font-semibold text-emerald-900 shrink-0 hover:bg-emerald-100/60 transition-colors shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
              m.sender === 'user'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-teal-100 text-teal-800 border border-teal-200'
            }`}>
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs font-medium'
                : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200 shadow-2xs'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              
              {/* Agent Decision Metadata if present */}
              {m.agent && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                      🎯 Intent: {m.agent.intent.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                      m.agent.confidence_level === 'high' 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : m.agent.confidence_level === 'medium'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-rose-50 border-rose-300 text-rose-800'
                    }`}>
                      Confidence: {Math.round(m.agent.confidence_score * 100)}% ({m.agent.confidence_level})
                    </span>
                  </div>

                  {m.agent.tools_used && m.agent.tools_used.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Tools used:</span>
                      {m.agent.tools_used.map(tool => (
                        <span key={tool} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-mono">
                          ⚙️ {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.agent.conflicts && m.agent.conflicts.length > 0 && (
                    <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[10px] space-y-1">
                      <span className="font-bold text-amber-900 block">⚠️ Cross-Tool Conflict Resolved:</span>
                      {m.agent.conflicts.map((c, i) => (
                        <div key={i} className="text-amber-800">
                          <p className="font-semibold">{c.title}</p>
                          <p className="text-amber-700/90">{c.resolution}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.agent.actions && m.agent.actions.length > 0 && (
                    <div className="p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-[10px]">
                      <span className="font-bold text-emerald-900 block mb-1">Recommended Next Steps:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                        {m.agent.actions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <span className={`block text-[9px] mt-1.5 ${
                m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
              }`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>AgriMind AI is reasoning agronomic data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="input-chatbot-query"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={language === 'te' ? 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...' : 'Ask about disease, NPK, irrigation, weather...'}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            id="btn-send-chat"
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
