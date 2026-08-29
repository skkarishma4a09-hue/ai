import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { translations } from '../translations';
import { soundService } from '../services/sound';
import {
  Heart,
  Droplets,
  DollarSign,
  Award,
  Sparkles,
  TrendingUp,
  X,
  CheckCircle2,
  Sprout,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'te';
  farmerName?: string;
  onNavigateToThankYouPage?: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  language,
  farmerName = 'Ramesh Patel',
  onNavigateToThankYouPage
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const devAppUrl = 'https://ais-dev-jzt4yxiuafws5z4bf3ye64-51586352780.asia-southeast1.run.app';

  useEffect(() => {
    if (isOpen) {
      // Launch celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // safe
      }
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(devAppUrl);
    setCopied(true);
    soundService.playChime();
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id="modal-thankyou-container"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header with warm farmer greeting */}
        <div className="p-6 bg-gradient-to-br from-amber-600 via-emerald-700 to-teal-800 text-white relative text-center">
          <button
            id="btn-close-thankyou-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-amber-200 mb-3 shadow-inner">
            <Heart className="w-8 h-8 fill-amber-300 text-amber-300 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold font-['Outfit']">
            {t.thankYouTitle}
          </h2>
          <p className="text-sm text-emerald-100 font-medium mt-1">
            {language === 'te' ? 'అన్నదాతా సుఖీభవ! మీ పంట సుసంపన్నం కావాలని కోరుకుంటున్నాము.' : 'Annadata Sukhibhava! Thank you for nourishing our nation.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-800">
              {farmerName} - Farm Session Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.thankYouSub}
            </p>
          </div>

          {/* Key Impact Stats Card Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-sky-50 border border-sky-200/70 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-sky-800">Water Conserved</p>
                <p className="text-lg font-bold text-sky-950 font-['Outfit']">4,200 L</p>
                <span className="text-[10px] text-sky-600 font-medium">via rain pause</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200/70 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-800">Fertilizer Saved</p>
                <p className="text-lg font-bold text-emerald-950 font-['Outfit']">₹1,850</p>
                <span className="text-[10px] text-emerald-600 font-medium">precision NPK</span>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50 border border-teal-200/70 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-teal-800">Crop Health Index</p>
                <p className="text-lg font-bold text-teal-950 font-['Outfit']">94%</p>
                <span className="text-[10px] text-teal-600 font-medium">Early Blight treated</span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-amber-800">Estimated Yield</p>
                <p className="text-lg font-bold text-amber-950 font-['Outfit']">280 Qtl</p>
                <span className="text-[10px] text-amber-600 font-medium">+18% above avg</span>
              </div>
            </div>
          </div>

          {/* Share Link Strip */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <Share2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs text-slate-700 truncate font-mono">{devAppUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Master Agent AI Assurance */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Master AI Autonomous Monitor is Running 24/7</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {language === 'te'
                ? 'మీరు లాగౌట్ అయినప్పటికీ మా AI ఏజెంట్ వాతావరణం, తెగుళ్ల ప్రమాదం మరియు నేల తేమను నిరంతరం పర్యవేక్షిస్తుంది. అవసరమైతే తక్షణమే నోటిఫికేషన్ పంపుతుంది.'
                : 'Even while away, AgriMind continuous background agents monitor satellite weather, soil moisture changes, and market pricing to alert you proactively.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            {onNavigateToThankYouPage && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToThankYouPage();
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'పూర్తి ధన్యవాదాలు పేజీని చూడండి' : 'Open Dedicated Thank You Webpage'}</span>
              </button>
            )}

            <button
              id="btn-return-dashboard"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2"
            >
              <Sprout className="w-4 h-4" />
              <span>{t.backToDashboard}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

