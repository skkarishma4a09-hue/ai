import React, { useState } from 'react';
import { WeatherData, IrrigationRecommendation } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  CloudRain,
  Droplets,
  Sun,
  Wind,
  Compass,
  Thermometer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  RefreshCw,
  Sliders,
  Play
} from 'lucide-react';

interface SmartIrrigationWeatherProps {
  weather: WeatherData | null;
  language: 'en' | 'te';
  onExecuteIrrigation?: () => void;
}

export const SmartIrrigationWeather: React.FC<SmartIrrigationWeatherProps> = ({
  weather,
  language,
  onExecuteIrrigation
}) => {
  const t = translations[language];
  const [soilMoisture, setSoilMoisture] = useState(38);
  const [growthStage, setGrowthStage] = useState('Flowering');
  const [rainForecastMm, setRainForecastMm] = useState(14.5);
  const [cropType, setCropType] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>({
    irrigationRequired: true,
    waterAmountMm: 5.5,
    waterAmountLitersPerAcre: 4200,
    recommendedTime: '05:30 AM (Cool morning window to avoid evaporation loss)',
    recommendedDurationMinutes: 28,
    reason: 'Soil moisture (38%) is below optimal target (45%). Tomato is in high-water-demand Flowering stage (Kc=1.15).',
    et0: 4.8,
    cropKc: 1.15,
    rainForecastImpact: 'Rain is forecasted in 24-36h. Apply moderate irrigation now; skip tomorrow.',
    timestamp: new Date().toISOString()
  });

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await apiService.recommendIrrigation({
        soilMoisture,
        cropType,
        growthStage,
        rainForecastMm,
        temperature: weather?.temperature || 30,
        humidity: weather?.humidity || 65
      });
      setRecommendation(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Real-Time Open-Meteo Current Weather & Alerts Banner */}
      <div 
        id="card-live-weather"
        className="p-6 bg-gradient-to-br from-sky-900 via-teal-900 to-emerald-950 rounded-3xl text-white shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Live Open-Meteo Satellite Agrometeorology</span>
            </div>
            
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl sm:text-5xl font-extrabold font-['Outfit']">
                {weather?.temperature || 30.5}°C
              </span>
              <span className="text-xl sm:text-2xl text-sky-200 font-semibold">
                {weather?.condition || 'Partly Cloudy'} {weather?.icon || '⛅'}
              </span>
            </div>

            <p className="text-xs text-sky-100/80 max-w-xl">
              📍 Guntur, Andhra Pradesh (16.30°N, 80.43°E) • Elevation 33m
            </p>
          </div>

          {/* Key Weather Metrics Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <div className="p-2 text-center">
              <span className="text-[10px] text-sky-200 block">{t.humidity}</span>
              <span className="text-base font-bold font-['Outfit']">{weather?.humidity || 65}%</span>
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-sky-200 block">Rain Probability</span>
              <span className="text-base font-bold font-['Outfit'] text-amber-300">
                {weather?.rainProbability || 25}%
              </span>
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-sky-200 block">{t.windSpeed}</span>
              <span className="text-base font-bold font-['Outfit']">{weather?.windSpeed || 12} km/h</span>
            </div>
            <div className="p-2 text-center">
              <span className="text-[10px] text-sky-200 block">FAO-56 ET₀</span>
              <span className="text-base font-bold font-['Outfit'] text-cyan-300">
                {weather?.et0 || 4.8} mm
              </span>
            </div>
          </div>
        </div>

        {/* Live Weather Alert Bar */}
        {weather?.alerts && weather.alerts.length > 0 && (
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-start space-x-2 text-xs text-amber-200 bg-amber-500/10 p-3 rounded-xl border border-amber-400/20">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{weather.alerts[0]}</span>
          </div>
        )}
      </div>

      {/* 2. 7-Day Agricultural Weather Forecast Strip */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
            7-Day Agrometeorology Forecast & Rain Chance
          </h2>
          <span className="text-xs text-slate-400">Refreshes every hour</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-2">
          {weather?.forecast?.map((day, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center transition-all ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                  : day.rainProb > 50
                  ? 'bg-sky-50/60 border-sky-200'
                  : 'bg-slate-50/80 border-slate-200'
              }`}
            >
              <p className="text-xs font-bold text-slate-800">{day.day}</p>
              <span className="text-2xl my-1 block">{day.icon}</span>
              <p className="text-xs font-bold text-slate-900 font-['Outfit']">
                {day.tempMax}° <span className="text-slate-400 font-normal">{day.tempMin}°</span>
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-center space-x-1 text-[11px] font-semibold text-sky-700">
                <CloudRain className="w-3 h-3" />
                <span>{day.rainProb}%</span>
              </div>
              {day.rainMm > 0 && (
                <span className="text-[10px] text-sky-600 block">{day.rainMm}mm</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Smart FAO-56 Irrigation Engine & Moisture Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Field Adjuster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-cyan-600" />
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Irrigation Parameters
              </h3>
            </div>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop & Variety</label>
              <select
                id="select-irrig-crop"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              >
                <option value="Tomato">Tomato (Kc: 1.15)</option>
                <option value="Cotton">Cotton (Kc: 1.10)</option>
                <option value="Chilli">Chilli (Kc: 1.05)</option>
                <option value="Paddy">Paddy Rice (Kc: 1.25)</option>
                <option value="Maize">Maize (Kc: 1.15)</option>
              </select>
            </div>

            {/* Growth Stage Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Growth Stage</label>
              <select
                id="select-growth-stage"
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              >
                <option value="Germination">Germination / Seedling (Kc: 0.45)</option>
                <option value="Vegetative">Vegetative Growth (Kc: 0.75)</option>
                <option value="Flowering">Flowering & Fruit Set (Kc: 1.15)</option>
                <option value="Fruiting">Fruiting / Fruit Development (Kc: 1.20)</option>
                <option value="Maturity">Maturity & Ripening (Kc: 0.85)</option>
              </select>
            </div>

            {/* Soil Moisture Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Current Soil Moisture Sensor</span>
                <span className="text-cyan-700 font-bold">{soilMoisture}%</span>
              </div>
              <input
                id="slider-soil-moisture"
                type="range"
                min="10"
                max="90"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10% (Dry Wilting)</span>
                <span className="text-emerald-700 font-bold">45-65% (Optimal)</span>
                <span>90% (Waterlogged)</span>
              </div>
            </div>

            {/* Rain Forecast Impact Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Rain Forecast Threshold (mm)</span>
                <span className="text-sky-700 font-bold">{rainForecastMm} mm</span>
              </div>
              <input
                id="slider-rain-forecast"
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={rainForecastMm}
                onChange={(e) => setRainForecastMm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <button
              id="btn-recalculate-irrigation"
              onClick={handleRecalculate}
              disabled={loading}
              className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Recalculate Water Volume</span>
            </button>
          </div>
        </div>

        {/* Right: AI Precision Drip Schedule & Water Requirement */}
        <div className="lg:col-span-7">
          {recommendation && (
            <div 
              id="card-irrigation-recommendation"
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5"
            >
              {/* Decision Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    recommendation.irrigationRequired
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {recommendation.irrigationRequired ? '💧 Water Application Required' : '🌧️ Postponed / Suspended'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] mt-1.5">
                    {recommendation.irrigationRequired
                      ? 'Precision Drip Fertigation Schedule'
                      : 'Irrigation Suspended (Natural Rain Coverage)'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  FAO-56 Calibrated
                </span>
              </div>

              {/* Water Volume Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-center">
                  <span className="text-xs text-cyan-800 font-medium">Daily Water Depth</span>
                  <p className="text-2xl font-bold text-cyan-950 font-['Outfit'] mt-0.5">
                    {recommendation.waterAmountMm} mm
                  </p>
                  <span className="text-[10px] text-cyan-600">ET₀: {recommendation.et0}mm × Kc</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
                  <span className="text-xs text-emerald-800 font-medium">Volume / Acre</span>
                  <p className="text-2xl font-bold text-emerald-950 font-['Outfit'] mt-0.5">
                    {recommendation.waterAmountLitersPerAcre.toLocaleString()} L
                  </p>
                  <span className="text-[10px] text-emerald-600">85% Drip Efficiency</span>
                </div>

                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <span className="text-xs text-teal-800 font-medium">Drip Runtime</span>
                  <p className="text-2xl font-bold text-teal-950 font-['Outfit'] mt-0.5">
                    {recommendation.recommendedDurationMinutes} mins
                  </p>
                  <span className="text-[10px] text-teal-600">Discharge: 150 L/min</span>
                </div>
              </div>

              {/* Timing & Reason Details */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Recommended Application Timing:</span>
                    <p className="text-slate-600 mt-0.5">{recommendation.recommendedTime}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Agronomic Justification:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{recommendation.reason}</p>
                  </div>
                </div>
              </div>

              {/* Execute / Push Button */}
              {recommendation.irrigationRequired && (
                <div className="pt-2">
                  <button
                    id="btn-execute-drip-irrigation"
                    onClick={() => {
                      if (onExecuteIrrigation) onExecuteIrrigation();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-cyan-700 to-emerald-700 hover:from-cyan-800 hover:to-emerald-800 text-white rounded-2xl text-sm font-bold shadow-md shadow-cyan-700/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <Droplets className="w-4 h-4" />
                    <span>Send Automation Signal to Drip Valves</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
