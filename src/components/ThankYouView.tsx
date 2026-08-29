import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { translations } from '../translations';
import { soundService } from '../services/sound';
import { User, DashboardData } from '../types';
import {
  Heart,
  Droplets,
  DollarSign,
  Award,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Sprout,
  ShieldCheck,
  Sparkles,
  Bot,
  Sun,
  Star,
  Send,
  LogIn,
  LogOut,
  ArrowLeft
} from 'lucide-react';

interface ThankYouViewProps {
  user: User | null;
  dashboardData: DashboardData | null;
  language: 'en' | 'te';
  onNavigateToDashboard: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const ThankYouView: React.FC<ThankYouViewProps> = ({
  user,
  dashboardData,
  language,
  onNavigateToDashboard,
  onOpenLogin,
  onLogout
}) => {
  const t = translations[language];
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const devAppUrl = 'https://ais-dev-jzt4yxiuafws5z4bf3ye64-51586352780.asia-southeast1.run.app';
  const sharedAppUrl = 'https://ais-pre-jzt4yxiuafws5z4bf3ye64-51586352780.asia-southeast1.run.app';
  const thankYouDirectUrl = `${devAppUrl}/?tab=thankyou`;

  useEffect(() => {
    // Launch celebratory confetti upon visiting the page
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // safe fallback
    }
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    soundService.playChime();
    setTimeout(() => setCopiedLink(null), 3000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    soundService.playSuccess();
  };

  const farmerDisplayName = user?.name || 'Ramesh Patel';

  return (
    <div id="thank-you-webpage" className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto pb-12">
      
      {/* Top Banner & Gratitude Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600 via-emerald-800 to-teal-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Heart className="w-10 h-10 fill-amber-300 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-400/20 border border-amber-300/40 rounded-full text-xs font-bold text-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'అన్నదాతా సుఖీభవ' : 'Annadata Sukhibhava • Farmer Appreciation'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] tracking-tight">
                {language === 'te' ? `ధన్యవాదాలు, ${farmerDisplayName} గారు!` : `Thank You, ${farmerDisplayName}!`}
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
                {language === 'te'
                  ? 'దేశానికి అన్నం పెట్టే అన్నదాతల శ్రమకు మా వందనం. మీ వ్యవసాయ ప్రయాణంలో AgriMind AI ఎల్లప్పుడూ మీకు తోడుగా ఉంటుంది.'
                  : 'Thank you for nourishing our nation. AgriMind AI is dedicated to empowering farmers with high-yield intelligence and sustainable farm profits.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-center gap-2.5 shrink-0">
            <button
              id="btn-thankyou-back-dashboard"
              onClick={onNavigateToDashboard}
              className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700" />
              <span>{language === 'te' ? 'డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి' : 'Back to Farm Dashboard'}</span>
            </button>
            {user ? (
              <button
                id="btn-thankyou-logout"
                onClick={onLogout}
                className="px-5 py-2.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-rose-400/40"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'te' ? 'లాగౌట్ అవ్వండి' : 'Logout Session'}</span>
              </button>
            ) : (
              <button
                id="btn-thankyou-login"
                onClick={onOpenLogin}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-emerald-400/40"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'te' ? 'లాగిన్ అవ్వండి' : 'Farmer Login'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shareable App & Webpage Output Links Card */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
                {language === 'te' ? 'యాప్ & వెబ్‌పేజీ లింకులు' : 'Application & Webpage Shareable Links'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'ఈ లింకులను సేవ్ చేయండి లేదా తోటి రైతులకు షేర్ చేయండి' : 'Access, bookmark, or share your AgriMind smart farm system anywhere'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Live Cloud Run Links
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main App Link */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Sprout className="w-4 h-4 mr-1.5 text-emerald-600" />
                AgriMind Live App Link:
              </span>
              <a
                href={devAppUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center"
              >
                <span>Open App</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={devAppUrl}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 select-all"
              />
              <button
                id="btn-copy-app-link"
                onClick={() => handleCopy(devAppUrl, 'app')}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
              >
                {copiedLink === 'app' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'app' ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Direct Thank You Page Link */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center">
                <Heart className="w-4 h-4 mr-1.5 text-amber-600 fill-amber-500" />
                Thank You Webpage Link:
              </span>
              <a
                href={thankYouDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-800 hover:text-amber-950 font-semibold flex items-center"
              >
                <span>Open Page</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={thankYouDirectUrl}
                className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono text-slate-700 select-all"
              />
              <button
                id="btn-copy-thankyou-link"
                onClick={() => handleCopy(thankYouDirectUrl, 'thankyou')}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
              >
                {copiedLink === 'thankyou' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink === 'thankyou' ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Session & Autonomous Impact Metrics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-['Outfit'] flex items-center">
          <Award className="w-5 h-5 mr-2 text-emerald-600" />
          {language === 'te' ? 'మీ వ్యవసాయ సెషన్ & ఆదా వివరాలు' : 'Current Farm Impact & Resource Savings'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-sky-200 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Water Conserved</p>
            <p className="text-2xl font-black text-sky-950 font-['Outfit']">4,200 L</p>
            <p className="text-xs text-sky-700 font-medium">Auto-postponed drip before rain</p>
          </div>

          <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Fertilizer Saved</p>
            <p className="text-2xl font-black text-emerald-950 font-['Outfit']">₹1,850</p>
            <p className="text-xs text-emerald-700 font-medium">Prevented excess nitrogen dosing</p>
          </div>

          <div className="p-5 bg-white border border-teal-200 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Crop Health Index</p>
            <p className="text-2xl font-black text-teal-950 font-['Outfit']">94%</p>
            <p className="text-xs text-teal-700 font-medium">Early Blight treated proactively</p>
          </div>

          <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Projected Farm Yield</p>
            <p className="text-2xl font-black text-amber-950 font-['Outfit']">285 Qtl</p>
            <p className="text-xs text-amber-700 font-medium">Estimated ₹5.4L net profit</p>
          </div>
        </div>
      </div>

      {/* 24/7 Autonomous AI Assurance */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold font-['Outfit']">
              {language === 'te' ? '24/7 ఆటోనామస్ మాస్టర్ AI నిరంతర నిఘా' : '24/7 Continuous Autonomous AI Monitoring'}
            </h3>
            <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed max-w-xl">
              {language === 'te'
                ? 'మీరు సిస్టమ్ నుండి నిష్క్రమించినా, AgriMind బ్యాక్‌గ్రౌండ్ ఏజెంట్లు ఉపగ్రహ వాతావరణం, మార్కెట్ రేట్లు మరియు నేల సెన్సార్లను నిరంతరం విశ్లేషిస్తూనే ఉంటాయి.'
                : 'Even after logging out, AgriMind background agents continuously track real-time weather forecasts, mandi prices, and soil moisture to keep your crops safe.'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-emerald-300">All 10 Agent Tools Active</span>
        </div>
      </div>

      {/* Farmer Feedback & Rating Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 font-['Outfit'] mb-2">
          {language === 'te' ? 'రైతు అభిప్రాయం & రేటింగ్' : 'Farmer Experience & Feedback'}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {language === 'te'
            ? 'AgriMind AI సలహాలు మీకు ఎలా ఉపయోగపడ్డాయి? మీ అనుభవాన్ని పంచుకోండి.'
            : 'How was your experience with AgriMind Autonomous AI decisions today?'}
        </p>

        {feedbackSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'te' ? 'మీ విలువైన అభిప్రాయానికి ధన్యవాదాలు!' : 'Thank you for your valuable feedback! Your response has been recorded.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700">Rating:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder={language === 'te' ? 'మీ సూచనలు లేదా పంట అనుభవాలను ఇక్కడ వ్రాయండి...' : 'Share any crop observations, mandi price notes, or suggestions...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'అభిప్రాయాన్ని పంపండి' : 'Submit Feedback'}</span>
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
