export type UserRole = 'farmer' | 'admin';

export type Language = 
  | 'en' // English
  | 'te' // Telugu (తెలుగు)
  | 'hi' // Hindi (हिन्दी)
  | 'ta' // Tamil (தமிழ்)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'mr' // Marathi (मराठी)
  | 'bn' // Bengali (বাংলা)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'ur'; // Urdu (اردو)

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  locale: string;
  flag: string;
  greeting: string;
  sampleVoicePrompt: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-IN', flag: '🇮🇳', greeting: 'Welcome to AgriMind', sampleVoicePrompt: 'What should I do today?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN', flag: '🌾', greeting: 'నమస్కారం! అగ్రిమైండ్‌కు స్వాగతం', sampleVoicePrompt: 'ఈరోజు నేను ఏమి చేయాలి?' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN', flag: '🇮🇳', greeting: 'नमस्ते! एग्रीमाइंड में आपका स्वागत है', sampleVoicePrompt: 'मुझे आज क्या करना चाहिए?' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN', flag: '🌱', greeting: 'வணக்கம்! அக்ரிமைண்டிற்கு நல்வரவு', sampleVoicePrompt: 'இன்று நான் என்ன செய்ய வேண்டும்?' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN', flag: '🌿', greeting: 'ನಮಸ್ಕಾರ! ಅಗ್ರಿಮೈಂಡ್‌ಗೆ ಸ್ವಾಗತ', sampleVoicePrompt: 'ಇಂದು ನಾನು ಏನು ಮಾಡಬೇಕು?' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN', flag: '🌴', greeting: 'നമസ്കാരം! അഗ്രിമൈൻഡിലേക്ക് സ്വാഗതം', sampleVoicePrompt: 'ഇന്ന് ഞാൻ എന്തു ചെയ്യണം?' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN', flag: '🚜', greeting: 'नमस्कार! अ‍ॅग्रीमाइंड मध्ये आपले स्वागत आहे', sampleVoicePrompt: 'मी आज काय करावे?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN', flag: '🌾', greeting: 'নমস্কার! এগ্রিমাইন্ডে স্বাগতম', sampleVoicePrompt: 'আজ আমার কী করা উচিত?' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', locale: 'gu-IN', flag: '🌱', greeting: 'નમસ્તે! એગ્રીમાઇન્ડમાં આપનું સ્વાગત છે', sampleVoicePrompt: 'મારે આજે શું કરવું જોઈએ?' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', locale: 'pa-IN', flag: '🌾', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਐਗਰੀਮਾਈਂਡ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ', sampleVoicePrompt: 'ਮੈਨੂੰ ਅੱਜ ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', locale: 'or-IN', flag: '🌿', greeting: 'ନମସ୍କାର! ଏଗ୍ରିମାଇଣ୍ଡକୁ ସ୍ଵାଗତ', sampleVoicePrompt: 'ଆଜି ମୁଁ କ’ଣ କରିବା ଉଚିତ୍?' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', locale: 'ur-IN', flag: '🌱', greeting: 'خوش آمدید! ایگری مائنڈ میں خوش آمدید', sampleVoicePrompt: 'مجھے آج کیا کرنا چاہیے؟' }
];

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  location: string;
  preferredLanguage: Language;
  createdAt: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  totalAreaAcres: number;
  soilType: string;
  currentCropId?: string;
  irrigationType: 'Drip' | 'Sprinkler' | 'Flood' | 'Furrow';
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Maturity' | 'Harvesting';
  areaAcres: number;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  soilMoistureOptimalMin: number;
  soilMoistureOptimalMax: number;
  targetYieldPerAcreQuintal: number;
}

export interface SoilData {
  id: string;
  farmId: string;
  timestamp: string;
  nitrogen: number; // mg/kg or kg/ha
  phosphorus: number;
  potassium: number;
  ph: number;
  moisturePercent: number;
  organicCarbonPercent: number;
  electricalConductivity: number; // dS/m
  healthScore: number; // 0 - 100
  deficiencies: string[];
  recommendations: string[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  rainProbability: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  icon: string;
  uvIndex: number;
  et0: number; // Reference Evapotranspiration mm/day
  forecast: Array<{
    date: string;
    day: string;
    tempMax: number;
    tempMin: number;
    rainProb: number;
    rainMm: number;
    condition: string;
    icon: string;
  }>;
  alerts: string[];
  farmingAdvisory: string;
}

export interface DiseaseResult {
  id: string;
  cropName: string;
  imageUrl?: string;
  diseaseName: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'None (Healthy)';
  symptoms: string[];
  treatmentChemical: string;
  treatmentOrganic: string;
  preventionTips: string[];
  expertWarning: string;
  timestamp: string;
}

export interface PestResult {
  id: string;
  cropName: string;
  pestName: string;
  scientificName?: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  damageType: string;
  biologicalControl: string;
  chemicalControl: string;
  scoutingAdvice: string;
  timestamp: string;
}

export interface FruitResult {
  id: string;
  fruitName: string;
  ripeness: 'Unripe' | 'Ripe' | 'Overripe';
  confidence: number;
  shelfLifeDays: number;
  sugarContentBrixEstimate: number;
  harvestRecommendation: string;
  storageTemperature: string;
  timestamp: string;
}

export interface IrrigationRecommendation {
  irrigationRequired: boolean;
  waterAmountMm: number;
  waterAmountLitersPerAcre: number;
  recommendedTime: string;
  recommendedDurationMinutes: number;
  reason: string;
  et0: number;
  cropKc: number;
  rainForecastImpact: string;
  timestamp: string;
}

export interface FertilizerRecommendation {
  crop: string;
  growthStage: string;
  recommendedFertilizers: Array<{
    name: string;
    dosageKgPerAcre: number;
    timing: string;
    method: string;
  }>;
  organicAlternatives: string[];
  excessiveUseWarning: string;
  guidance: string;
}

export interface YieldPrediction {
  crop: string;
  predictedYieldQuintalsPerAcre: number;
  totalPredictedYieldQuintals: number;
  confidenceScore: number;
  influencingFactors: {
    soilFactor: number;
    weatherFactor: number;
    irrigationFactor: number;
    fertilizerFactor: number;
  };
  benchmarks: {
    regionalAverage: number;
    progressiveFarmerTarget: number;
  };
  tipsToIncreaseYield: string[];
}

export interface ProfitCalculation {
  seedCost: number;
  fertilizerCost: number;
  labourCost: number;
  irrigationCost: number;
  pesticideCost: number;
  otherExpenses: number;
  totalCost: number;
  expectedYieldQuintals: number;
  expectedPricePerQuintal: number;
  grossRevenue: number;
  netProfit: number;
  roiPercentage: number;
  breakEvenYieldQuintals: number;
}

export interface MarketPrice {
  id: string;
  crop: string;
  marketName: string;
  state: string;
  currentPrice: number; // per Quintal
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceChangePercent: number;
  priceTrend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
  historicalPrices: Array<{
    date: string;
    price: number;
  }>;
}

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type NotificationType = 
  | 'weather' 
  | 'rain' 
  | 'irrigation' 
  | 'spraying' 
  | 'fertilizer' 
  | 'disease' 
  | 'pest' 
  | 'harvest' 
  | 'general';

export interface NotificationItem {
  id: string;
  userId: string;
  farmId?: string;
  cropId?: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  scheduledAt: string;
  createdAt: string;
  isRead: boolean;
  status: 'active' | 'dismissed' | 'executed';
  actionable?: {
    type: 'irrigate' | 'spray' | 'fertilize' | 'harvest' | 'inspect';
    label: string;
  };
}

export interface CropSchedule {
  id: string;
  farmId: string;
  cropId: string;
  cropName: string;
  taskType: 'irrigation' | 'spraying' | 'fertilizer' | 'harvest' | 'scouting';
  taskName: string;
  scheduledAt: string;
  recommendedTime: string;
  frequency: 'Once' | 'Daily' | 'Weekly' | 'Bi-weekly';
  notes: string;
  status: 'Pending' | 'Completed' | 'Postponed' | 'Cancelled';
  weatherCheckStatus?: 'Suitable' | 'Rain Postponed' | 'High Wind Warning';
}

export type CropScheduleItem = CropSchedule;
export type DiseasePredictionResult = DiseaseResult;
export type PestPredictionResult = PestResult;
export type FruitAnalysisResult = FruitResult;

export interface CropRecommendationItem {
  crop: string;
  suitability: number;
  season: string;
  waterRequirement: string;
  expectedYield: string;
  soilSuitability: string;
  cultivationGuide: string;
}

export type ProfitPredictionResult = ProfitCalculation;

export interface DashboardData {
  farm: Farm;
  crop: Crop;
  soil: SoilData;
  weather: WeatherData;
  masterDecision: MasterAgentDecision;
  recentNotifications: NotificationItem[];
  recentPredictions: {
    diseases: DiseaseResult[];
    pests: PestResult[];
    fruits: FruitResult[];
  };
}

export interface AgentConflict {
  type: string;
  title: string;
  description: string;
  resolution: string;
}

export interface AgentDecisionResult {
  intent: string;
  plan: string[];
  tools_used: string[];
  failed_tools?: string[];
  tool_results: Record<string, any>;
  conflicts: AgentConflict[];
  recommendation: string;
  spoken_response?: string;
  language?: {
    code: string;
    name: string;
  };
  reasoning_summary: string;
  confidence_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  actions: string[];
  warnings: string[];
  risk?: {
    overall: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    weather?: string;
    disease?: string;
    pest?: string;
    water?: string;
  };
  voice?: {
    available: boolean;
    language: string;
  };
  alert?: {
    required: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  timestamp?: string;
}

export interface DailyBriefingResponse {
  success: boolean;
  language: {
    code: string;
    name: string;
    locale: string;
  };
  date: string;
  greeting: string;
  farm_name: string;
  crop_name: string;
  growth_stage: string;
  weather_summary: string;
  spoken_briefing: string;
  bullet_points: string[];
  key_advisory: string;
  urgency: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
  audio_available: boolean;
}

export interface AgentDecisionResponse {
  success: boolean;
  agent: AgentDecisionResult;
  error?: string;
}

export interface AgentHealthResponse {
  agent_available: boolean;
  llm_available: boolean;
  tools_available: boolean;
  ml_service_available: boolean;
  registered_tools_count: number;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  language: Language;
  timestamp: string;
  suggestedActions?: string[];
  agent?: AgentDecisionResult;
}

export interface MasterAgentDecision {
  status: 'Optimal' | 'Action Needed' | 'Critical Alert';
  overallHealthScore: number;
  keyInsights: {
    weatherInsight: string;
    soilInsight: string;
    visionInsight: string;
    irrigationInsight: string;
    nutrientInsight: string;
  };
  autonomousActionPlan: Array<{
    id: string;
    agent: 'Irrigation AI' | 'Fertilizer AI' | 'Crop Vision AI' | 'Weather AI' | 'Pest AI';
    priority: NotificationPriority;
    actionTitle: string;
    description: string;
    scheduledWindow: string;
    estimatedBenefit: string;
    requiresApproval: boolean;
    executed: boolean;
  }>;
  activeAlertCount: number;
  lastOrchestrationTime: string;
}

export interface NotificationSettings {
  weatherAlerts: boolean;
  rainAlerts: boolean;
  irrigationReminders: boolean;
  fertilizerReminders: boolean;
  sprayingReminders: boolean;
  diseaseAlerts: boolean;
  pestAlerts: boolean;
  harvestReminders: boolean;
  browserNotifications: boolean;
  soundAlerts: boolean;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 'WEATHER' | 'SOIL' | 'IRRIGATION' | 'DISEASE' | 'PEST' | 'FERTILIZER' | 'CROP' | 'YIELD' | 'MARKET' | 'PROFIT' | 'GENERAL FARM RISK';
export type AlertStatus = 'NEW' | 'SEEN' | 'ACKNOWLEDGED' | 'RESOLVED';
export type SoundType = 'notification' | 'attention' | 'warning' | 'critical' | 'success';

export interface AlertItem {
  id: string;
  farmId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommended_action: string;
  confidence: number;
  sound_required: boolean;
  voice_required: boolean;
  sound: SoundType;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AlertPreferences {
  voiceAlertsEnabled: boolean;
  alarmSoundsEnabled: boolean;
  criticalAlertsAlwaysOn: boolean;
  language: 'en' | 'te' | 'hi';
  speed: 'slow' | 'normal' | 'fast';
  volume: number;
}

