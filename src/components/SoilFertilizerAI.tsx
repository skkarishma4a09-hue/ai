import React, { useState } from 'react';
import { SoilData, FertilizerRecommendation } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  Layers,
  Sprout,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  RefreshCw,
  Zap,
  Pill,
  Scale
} from 'lucide-react';

interface SoilFertilizerAIProps {
  initialSoil: SoilData | null;
  language: 'en' | 'te';
}

export const SoilFertilizerAI: React.FC<SoilFertilizerAIProps> = ({
  initialSoil,
  language
}) => {
  const t = translations[language];
  const [nitrogen, setNitrogen] = useState(initialSoil?.nitrogen || 180);
  const [phosphorus, setPhosphorus] = useState(initialSoil?.phosphorus || 24);
  const [potassium, setPotassium] = useState(initialSoil?.potassium || 160);
  const [ph, setPh] = useState(initialSoil?.ph || 6.8);
  const [moisture, setMoisture] = useState(initialSoil?.moisturePercent || 38);
  const [crop, setCrop] = useState('Tomato');
  const [loading, setLoading] = useState(false);

  const [soilResult, setSoilResult] = useState<SoilData | null>(initialSoil);
  const [fertResult, setFertResult] = useState<FertilizerRecommendation | null>({
    crop: 'Tomato',
    growthStage: 'Flowering & Fruit Development',
    recommendedFertilizers: [
      { name: '13:0:45 (Potassium Nitrate)', dosageKgPerAcre: 8, timing: 'Early Morning 6:00 AM', method: 'Drip fertigation' },
      { name: 'Calcium Nitrate + Boron', dosageKgPerAcre: 4, timing: 'Evening 5:00 PM', method: 'Foliar Spray @ 2g/L' },
      { name: 'Sulphate of Potash (0-0-50)', dosageKgPerAcre: 10, timing: 'Weekly', method: 'Drip Line' }
    ],
    organicAlternatives: [
      'Enriched Vermicompost @ 500 kg/acre',
      'Panchagavya liquid @ 3% foliar spray',
      'Neem cake @ 100 kg/acre applied around drip zone'
    ],
    excessiveUseWarning: '⚠️ Do NOT mix Calcium Nitrate with Phosphate or Sulphate fertilizers in the same fertilizer tank to prevent insoluble precipitation.',
    guidance: 'Doses calibrated for black clay loam soil. Soil pH of 6.8 ensures over 85% nutrient uptake efficiency.'
  });

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await apiService.analyzeSoil({
        n: nitrogen,
        p: phosphorus,
        k: potassium,
        ph,
        moisture,
        crop
      });
      setSoilResult(res.analysis);
      setFertResult(res.recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-emerald-300" />
              <span>Soil Health Card & Nutrient AI</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.soilAnalysis}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'నేల నమూనా పరీక్ష ఫలితాలను నమోదు చేసి నేల ఆరోగ్య స్కోర్, లోపించిన పోషకాలు మరియు ఖచ్చితమైన ఎరువుల మోతాదు పొందండి.'
                : 'Input your NPK and pH lab test values for instant soil health scoring, deficiency detection, and precision fertilizer dosages.'}
            </p>
          </div>

          {/* Soil Health Score Badge */}
          <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/20 text-center min-w-[160px]">
            <span className="text-xs text-emerald-200 font-semibold">{t.soilHealthScore}</span>
            <p className="text-3xl font-extrabold text-white font-['Outfit'] my-1">
              {soilResult?.healthScore || 78}/100
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold">
              Good Soil Condition
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Sliders & Diagnostics Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive NPK & pH Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center">
              <Scale className="w-4 h-4 mr-2 text-emerald-600" />
              Soil Test Parameters
            </h3>

            {/* Target Crop */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Crop</label>
              <select
                id="select-soil-crop"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
              >
                <option value="Tomato">Tomato (టమాట)</option>
                <option value="Cotton">Cotton (పత్తి)</option>
                <option value="Chilli">Chilli (మిరప)</option>
                <option value="Paddy">Paddy / Rice (వరి)</option>
                <option value="Maize">Maize (మొక్కజొన్న)</option>
              </select>
            </div>

            {/* Nitrogen (N) Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t.nitrogen} (N)</span>
                <span className="text-emerald-700 font-bold">{nitrogen} mg/kg</span>
              </div>
              <input
                id="slider-nitrogen"
                type="range"
                min="50"
                max="400"
                value={nitrogen}
                onChange={(e) => setNitrogen(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Low (&lt;140)</span>
                <span className="text-emerald-600 font-bold">Medium (140-280)</span>
                <span>High (&gt;280)</span>
              </div>
            </div>

            {/* Phosphorus (P) Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t.phosphorus} (P)</span>
                <span className="text-teal-700 font-bold">{phosphorus} mg/kg</span>
              </div>
              <input
                id="slider-phosphorus"
                type="range"
                min="5"
                max="60"
                value={phosphorus}
                onChange={(e) => setPhosphorus(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Low (&lt;15)</span>
                <span className="text-teal-600 font-bold">Optimal (15-35)</span>
                <span>High (&gt;35)</span>
              </div>
            </div>

            {/* Potassium (K) Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t.potassium} (K)</span>
                <span className="text-cyan-700 font-bold">{potassium} mg/kg</span>
              </div>
              <input
                id="slider-potassium"
                type="range"
                min="50"
                max="350"
                value={potassium}
                onChange={(e) => setPotassium(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Low (&lt;150)</span>
                <span className="text-cyan-600 font-bold">Medium (150-250)</span>
                <span>High (&gt;250)</span>
              </div>
            </div>

            {/* pH Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t.soilPh}</span>
                <span className="text-amber-700 font-bold">{ph}</span>
              </div>
              <input
                id="slider-ph"
                type="range"
                min="4.5"
                max="9.5"
                step="0.1"
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Acidic (&lt;6.0)</span>
                <span className="text-emerald-600 font-bold">Neutral (6.5-7.5)</span>
                <span>Alkaline (&gt;8.0)</span>
              </div>
            </div>

            <button
              id="btn-analyze-soil-nutrients"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Analyze Soil Health & Fertilizers</span>
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostic Output & Fertilizer Prescription */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Deficiencies & Health Card */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                Deficiency & Soil Diagnostic Summary
              </h3>
              <span className="text-xs text-slate-400">
                EC: {soilResult?.electricalConductivity || 0.65} dS/m • OC: {soilResult?.organicCarbonPercent || 0.72}%
              </span>
            </div>

            {/* Deficiencies Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">Detected Nutritional Deficiencies:</span>
              {soilResult?.deficiencies && soilResult.deficiencies.length > 0 ? (
                <div className="space-y-2">
                  {soilResult.deficiencies.map((def, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{def}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No major NPK deficiencies. Soil parameters are within ideal agricultural range.</span>
                </div>
              )}
            </div>
          </div>

          {/* Fertilizer Prescription Plan */}
          {fertResult && (
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span>Customized Fertilizer Application Schedule</span>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Stage: {fertResult.growthStage}
                </span>
              </div>

              {/* Recommended Chemicals Table */}
              <div className="space-y-2">
                {fertResult.recommendedFertilizers.map((f, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{f.name}</p>
                      <p className="text-[11px] text-slate-500">Method: {f.method} • Timing: {f.timing}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-extrabold text-emerald-800 font-['Outfit']">
                        {f.dosageKgPerAcre} kg / Acre
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Organic Alternatives */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5 text-xs">
                <span className="font-bold text-emerald-900 flex items-center">
                  <Sprout className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Organic & Bio-Fertilizer Alternatives:
                </span>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {fertResult.organicAlternatives.map((org, i) => (
                    <li key={i}>{org}</li>
                  ))}
                </ul>
              </div>

              {/* Excessive Usage Warning */}
              {fertResult.excessiveUseWarning && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-xs text-rose-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{fertResult.excessiveUseWarning}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
