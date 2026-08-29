import {
  User,
  Farm,
  Crop,
  SoilData,
  WeatherData,
  DiseaseResult,
  PestResult,
  FruitResult,
  IrrigationRecommendation,
  FertilizerRecommendation,
  YieldPrediction,
  ProfitCalculation,
  MarketPrice,
  NotificationItem,
  CropSchedule,
  MasterAgentDecision,
  ChatMessage
} from '../types';

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async register(data: { name: string; username: string; password: string; phone: string; location: string; role: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  async getMe(): Promise<{ user: User | null }> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return { user: null };
      return res.json();
    } catch {
      return { user: null };
    }
  },

  // Dashboard & Master Agent
  async getDashboard(): Promise<{
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
  }> {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed to load dashboard data');
    return res.json();
  },

  async getMasterDecision(): Promise<MasterAgentDecision> {
    const res = await fetch('/api/master-agent/orchestrate');
    return res.json();
  },

  async executeMasterAction(actionId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/master-agent/execute-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId })
    });
    return res.json();
  },

  // Farms
  async getFarms(): Promise<Farm[]> {
    const res = await fetch('/api/farms');
    return res.json();
  },

  async updateFarm(farm: Partial<Farm>): Promise<Farm> {
    const res = await fetch('/api/farms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farm)
    });
    return res.json();
  },

  // Soil
  async analyzeSoil(params: {
    n: number;
    p: number;
    k: number;
    ph: number;
    moisture?: number;
    crop?: string;
  }): Promise<{
    analysis: SoilData;
    recommendation: FertilizerRecommendation;
  }> {
    const res = await fetch('/api/soil/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Crop Recommendation
  async recommendCrops(params: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    temperature: number;
    humidity: number;
    rainfall: number;
  }): Promise<{
    recommendedCrops: Array<{
      crop: string;
      confidence: number;
      season: string;
      waterRequirement: string;
      expectedYield: string;
      soilSuitability: string;
      cultivationGuide: string;
    }>;
  }> {
    const res = await fetch('/api/crops/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Vision AI (Disease, Pest, Fruit)
  async predictDisease(formData: { imageBase64?: string; cropName: string; symptomsHint?: string }): Promise<DiseaseResult> {
    const res = await fetch('/api/disease/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  async predictPest(formData: { imageBase64?: string; cropName: string }): Promise<PestResult> {
    const res = await fetch('/api/pest/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  async analyzeFruit(formData: { imageBase64?: string; fruitTypeHint?: string }): Promise<FruitResult> {
    const res = await fetch('/api/fruit/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return res.json();
  },

  // Weather
  async getWeather(location?: string, lat?: number, lon?: number): Promise<WeatherData> {
    const query = new URLSearchParams();
    if (location) query.set('location', location);
    if (lat) query.set('lat', lat.toString());
    if (lon) query.set('lon', lon.toString());
    const res = await fetch(`/api/weather?${query.toString()}`);
    return res.json();
  },

  // Smart Irrigation
  async getIrrigationRecommendation(params: {
    soilMoisture: number;
    cropType: string;
    growthStage: string;
    temperature?: number;
    humidity?: number;
    rainForecastMm?: number;
  }): Promise<IrrigationRecommendation> {
    const res = await fetch('/api/irrigation/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Fertilizer Recommendation
  async getFertilizerRecommendation(params: {
    crop: string;
    growthStage: string;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
  }): Promise<FertilizerRecommendation> {
    const res = await fetch('/api/fertilizer/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Yield Prediction
  async predictYield(params: {
    crop: string;
    areaAcres: number;
    soilScore: number;
    weatherCondition: string;
    irrigationType: string;
    fertilizerDoseKg: number;
  }): Promise<YieldPrediction> {
    const res = await fetch('/api/yield/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Profit Calculation
  async predictProfit(params: {
    crop: string;
    areaAcres: number;
    seedCost: number;
    fertilizerCost: number;
    labourCost: number;
    irrigationCost: number;
    pesticideCost: number;
    otherExpenses: number;
    expectedYieldQuintals: number;
    expectedPricePerQuintal: number;
  }): Promise<ProfitCalculation> {
    const res = await fetch('/api/profit/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Market Prices
  async getMarketPrices(crop?: string): Promise<{
    markets: MarketPrice[];
    stateAverages: Array<{ crop: string; averagePrice: number; trend: string }>;
  }> {
    const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
    const res = await fetch(`/api/market/prices${query}`);
    return res.json();
  },

  // Notifications & Alerts
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const res = await fetch('/api/notifications/unread-count');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    return res.json();
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getActiveAlerts(): Promise<NotificationItem[]> {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  // Crop Schedules
  async getCropSchedules(): Promise<CropSchedule[]> {
    const res = await fetch('/api/crop-schedules');
    return res.json();
  },

  async createCropSchedule(schedule: Partial<CropSchedule>): Promise<CropSchedule> {
    const res = await fetch('/api/crop-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule)
    });
    return res.json();
  },

  async updateCropSchedule(id: string, updates: Partial<CropSchedule>): Promise<CropSchedule> {
    const res = await fetch(`/api/crop-schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteCropSchedule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/crop-schedules/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Real Agentic AI Decision System APIs
  async getAgentHealth(): Promise<import('../types').AgentHealthResponse> {
    const res = await fetch('/api/agent/health');
    return res.json();
  },

  async getLanguages(): Promise<{ success: boolean; languages: any[] }> {
    const res = await fetch('/api/voice/languages');
    return res.json();
  },

  async getDailyBriefing(language: import('../types').Language = 'en', farmId?: string): Promise<import('../types').DailyBriefingResponse> {
    const query = new URLSearchParams();
    query.set('lang', language);
    if (farmId) query.set('farm_id', farmId);
    const res = await fetch(`/api/agent/daily-briefing?${query.toString()}`);
    return res.json();
  },

  async getDailyPlan(params?: {
    farm_id?: string;
    language?: import('../types').Language;
    context?: Record<string, any>;
  }): Promise<{ success: boolean; daily_plan: any }> {
    const res = await fetch('/api/agent/daily-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {})
    });
    return res.json();
  },

  async getAgentDecision(params: {
    message: string;
    farm_id?: string;
    language?: import('../types').Language;
    context?: Record<string, any>;
  }): Promise<import('../types').AgentDecisionResponse> {
    const res = await fetch('/api/agent/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async sendChatMessage(message: string, language: import('../types').Language = 'en'): Promise<ChatMessage> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language })
    });
    return res.json();
  },

  // Alerts API
  async getAlerts(params?: { status?: string; severity?: string; farmId?: string }): Promise<{ success: boolean; count: number; alerts: import('../types').AlertItem[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    if (params?.farmId) query.set('farmId', params.farmId);
    const res = await fetch(`/api/alerts?${query.toString()}`);
    return res.json();
  },

  async getUnreadAlerts(): Promise<{ success: boolean; count: number; alerts: import('../types').AlertItem[] }> {
    const res = await fetch('/api/alerts/unread');
    return res.json();
  },

  async getCriticalAlerts(): Promise<{ success: boolean; count: number; alerts: import('../types').AlertItem[] }> {
    const res = await fetch('/api/alerts/critical');
    return res.json();
  },

  async acknowledgeAlert(id: string): Promise<{ success: boolean; alert?: import('../types').AlertItem }> {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
    return res.json();
  },

  async resolveAlert(id: string): Promise<{ success: boolean; alert?: import('../types').AlertItem }> {
    const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
    return res.json();
  },

  async getAlertPreferences(): Promise<{ success: boolean; preferences: import('../types').AlertPreferences }> {
    const res = await fetch('/api/alerts/preferences');
    return res.json();
  },

  async updateAlertPreferences(preferences: Partial<import('../types').AlertPreferences>): Promise<{ success: boolean; preferences: import('../types').AlertPreferences }> {
    const res = await fetch('/api/alerts/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return res.json();
  },

  async synthesizeVoice(text: string, language = 'en', speed = 'normal'): Promise<any> {
    const res = await fetch('/api/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language, speed })
    });
    return res.json();
  },

  // Aliases for component convenience
  async sendMessage(message: string, language: 'en' | 'te'): Promise<ChatMessage> {
    return this.sendChatMessage(message, language);
  },

  async recommendIrrigation(params: {
    soilMoisture: number;
    cropType: string;
    growthStage: string;
    temperature?: number;
    humidity?: number;
    rainForecastMm?: number;
  }): Promise<IrrigationRecommendation> {
    return this.getIrrigationRecommendation(params);
  },

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return this.markNotificationRead(id);
  }
};

export const apiService = api;


