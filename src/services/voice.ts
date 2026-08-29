// Comprehensive Multilingual Voice Engine for AgriMind (TTS & STT with Web Speech API + 12 Indian Languages)
import { Language, SUPPORTED_LANGUAGES } from '../types';

export interface VoiceSettings {
  voiceAlertsEnabled: boolean;
  alarmSoundsEnabled: boolean;
  criticalAlertsAlwaysOn: boolean;
  language: Language;
  speed: 'slow' | 'normal' | 'fast';
  volume: number; // 0.0 to 1.0
  autoSpeakBriefing: boolean;
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceAlertsEnabled: true,
  alarmSoundsEnabled: true,
  criticalAlertsAlwaysOn: true,
  language: 'en',
  speed: 'normal',
  volume: 0.9,
  autoSpeakBriefing: false
};

export const LOCALE_MAP: Record<Language, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  ur: 'ur-IN'
};

type VoiceStateListener = (state: {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string | null;
  isListening: boolean;
}) => void;

class VoiceService {
  private settings: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS };
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private currentText: string | null = null;
  private listeners: Set<VoiceStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      this.loadSettings();
      this.initRecognition();
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('agrimind_voice_settings');
      if (saved) {
        this.settings = { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
  }

  public saveSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('agrimind_voice_settings', JSON.stringify(this.settings));
    } catch {}
    this.notifyState();
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      currentText: this.currentText,
      isListening: this.isListening
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState() {
    this.listeners.forEach(fn => {
      fn({
        isSpeaking: this.isSpeaking,
        isPaused: this.isPaused,
        currentText: this.currentText,
        isListening: this.isListening
      });
    });
  }

  private getRate(): number {
    switch (this.settings.speed) {
      case 'slow': return 0.82;
      case 'fast': return 1.25;
      case 'normal':
      default:
        return 1.0;
    }
  }

  public getLocaleCode(lang?: Language): string {
    const target = lang || this.settings.language;
    return LOCALE_MAP[target] || 'en-IN';
  }

  // Detect script or language keywords in spoken string
  public detectLanguage(text: string): Language {
    if (!text || !text.trim()) return this.settings.language;

    // Unicode Script Range Detection
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
    if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia
    if (/[\u0600-\u06FF]/.test(text)) return 'ur'; // Urdu
    if (/[\u0900-\u097F]/.test(text)) {
      // Check for Marathi-specific words
      if (/\b(आहे|नाही|काय|करावे|शेती|पाऊस|खत|पीक|शेतकरी)\b/.test(text)) return 'mr';
      return 'hi'; // Hindi Devanagari default
    }

    // Romanized/English keywords for language names
    const lower = text.toLowerCase();
    if (lower.includes('telugu') || lower.includes('తెలుగు')) return 'te';
    if (lower.includes('hindi') || lower.includes('हिन्दी')) return 'hi';
    if (lower.includes('tamil') || lower.includes('தமிழ்')) return 'ta';
    if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) return 'kn';
    if (lower.includes('malayalam') || lower.includes('മലയാളം')) return 'ml';
    if (lower.includes('marathi') || lower.includes('मराठी')) return 'mr';
    if (lower.includes('bengali') || lower.includes('bangla') || lower.includes('বাংলা')) return 'bn';
    if (lower.includes('gujarati') || lower.includes('ગુજરાતી')) return 'gu';
    if (lower.includes('punjabi') || lower.includes('ਪੰਜਾਬੀ')) return 'pa';
    if (lower.includes('odia') || lower.includes('oriya') || lower.includes('ଓଡ଼ିଆ')) return 'or';
    if (lower.includes('urdu') || lower.includes('اردو')) return 'ur';
    if (lower.includes('english')) return 'en';

    return this.settings.language;
  }

  // Parse Voice Navigation Intent
  public parseVoiceNavigation(spokenText: string): string | null {
    const text = spokenText.toLowerCase();

    if (/weather|వాతావరణం|मौसम|வானிலை|ಹವಾಮಾನ|കാലാവസ്ഥ|हवामान|আবহাওয়া|હવામાન|ਮੌਸਮ|ପାଣିପାଗ|موسم/.test(text)) {
      return 'weather';
    }
    if (/alerts|alert|హెచ్చరిక|अलर्ट|எச்சரிக்கை|ಎಚ್ಚರಿಕೆ|മുന്നറിയിപ്പ്|इशारे|সতর্কতা|ચેતવણી|ਚਿਤਾਵਨੀ|ସତର୍କତା|انتباہ/.test(text)) {
      return 'alerts';
    }
    if (/irrigation|water|నీరు|నీటిపారుదల|सिंचाई|பாசனம்|ನೀರಾವರಿ|നനയ്ക്കൽ|सिंचन|সেচ|સિંચાઈ|ਸਿੰਚਾਈ|ଜଳସେଚନ|آبپاشی/.test(text)) {
      return 'irrigation';
    }
    if (/soil|fertilizer|నేల|ఎరువు|मिट्टी|खाद|மண்|உரம்|ಮಣ್ಣು|ಗೊಬ್ಬರ|മണ്ണ്|വളം|माती|खत|মাটি|সার|જમીન|ખાતર|ਮਿੱਟੀ|ਖਾਦ|ମାଟି|ସାର|مٹی|کھاد/.test(text)) {
      return 'soil';
    }
    if (/vision|disease|pest|camera|ఫోటో|తెగులు|रोग|కీడ|நோய்|രോഗം|रोग|রোগ|રોગ|ਬਿਮਾਰੀ|ରୋଗ|بیماری/.test(text)) {
      return 'vision';
    }
    if (/market|mandi|price|ధర|भाव|விலை|ಧಾರಣೆ|വില|भाव|দাম|ભાવ|ਭਾਅ|ଦର|نرخ/.test(text)) {
      return 'market';
    }
    if (/easy mode|simple|రైతు మోడ్|आसान मोड|எளிய முறை|ಸರಳ ಮೋಡ್|ലളിത മോഡ്|सुलभ मोड|সহজ মোড|સરળ મોડ|ਸੌਖਾ ਮੋਡ|ସହଜ ମୋଡ୍|آسان موڈ/.test(text)) {
      return 'easymode';
    }
    if (/today|plan|briefing|ఈరోజు|आज|இன்று|ಇಂದು|ഇന്ന്|आज|আজ|આજે|ਅੱਜ|ଆଜି|آج/.test(text)) {
      return 'briefing';
    }

    return null;
  }

  // Parse Voice Yes/No Confirmation
  public parseVoiceConfirmation(spokenText: string): 'YES' | 'NO' | null {
    const text = spokenText.toLowerCase();

    // Affirmative
    if (/\b(yes|yeah|yep|confirm|approve|proceed|execute|done|ok|okay|sure|అవును|సరే|నిర్ధారించు|हाँ|हाँजी|ठीक|स्वीकार|ஆம்|சரி|ஹೌದು|ಸರಿ|അതെ|ശരി|होय|हो|ठीक|হ্যাঁ|ঠিক|હા|બરાબર|ਹਾਂ|ਠੀਕ|ହଁ|ଠିକ୍|ہاں|ٹھیک)\b/.test(text)) {
      return 'YES';
    }

    // Negative
    if (/\b(no|nope|cancel|reject|abort|stop|dont|don't|కాదు|వద్దు|రద్దు|नहीं|ना|रद्द|இல்லை|வேண்டாம்|ಇಲ್ಲ|ಬೇಡ|അല്ല|വേണ്ട|नाही|नको|না|বাতিল|ના|રદ|ਨਹੀਂ|ਰੱਦ|ନା|ବାତିଲ|نہیں|منسوخ)\b/.test(text)) {
      return 'NO';
    }

    return null;
  }

  // Text-To-Speech
  public speak(text: string, options: {
    isCritical?: boolean;
    language?: Language;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}): boolean {
    if (!text || !text.trim()) return false;

    // Check if voice alerts are disabled
    if (!this.settings.voiceAlertsEnabled && !(options.isCritical && this.settings.criticalAlertsAlwaysOn)) {
      return false;
    }

    if (!this.synth && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }

    if (!this.synth) {
      console.warn('Browser SpeechSynthesis is not supported on this device.');
      return false;
    }

    try {
      this.synth.cancel(); // Stop prior speech

      const cleanText = text
        .replace(/[*_#`~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;
      this.currentText = cleanText;

      utterance.rate = this.getRate();
      utterance.volume = Math.max(0.1, Math.min(1.0, this.settings.volume));
      
      const targetLang = options.language || this.settings.language;
      const localeCode = this.getLocaleCode(targetLang);
      utterance.lang = localeCode;

      // Select natural voice matching language
      const voices = this.synth.getVoices();
      const prefix = localeCode.slice(0, 2);
      const matchedVoice = voices.find(v => v.lang.startsWith(prefix) || v.lang === localeCode)
        || voices.find(v => v.lang.includes('IN') || v.lang.startsWith('en'));
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.notifyState();
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentText = null;
        this.currentUtterance = null;
        this.notifyState();
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentText = null;
        this.currentUtterance = null;
        this.notifyState();
        options.onError?.(e);
      };

      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.error('Speech synthesis failure:', err);
      return false;
    }
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  public resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentText = null;
    this.currentUtterance = null;
    this.notifyState();
  }

  // Speech-To-Text (Microphone Recognition)
  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      } catch {
        this.recognition = null;
      }
    }
  }

  public isSTTSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(callbacks: {
    language?: Language;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (err: any) => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      callbacks.onError?.(new Error('Speech recognition not supported in this browser.'));
      return false;
    }

    try {
      const targetLang = callbacks.language || this.settings.language;
      this.recognition.lang = this.getLocaleCode(targetLang);
      this.isListening = true;
      this.notifyState();

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        callbacks.onResult(transcript, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        this.notifyState();
        callbacks.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyState();
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      this.notifyState();
      callbacks.onError?.(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      this.notifyState();
    }
  }
}

export const voiceService = new VoiceService();
