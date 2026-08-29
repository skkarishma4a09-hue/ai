import React, { useState } from 'react';
import { CropRecommendationItem, ProfitPredictionResult } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  TrendingUp,
  DollarSign,
  Sprout,
  Calculator,
  Award,
  Sparkles,
  PieChart,
  Percent,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface CropYieldProfitProps {
  language: 'en' | 'te';
}

export const CropYieldProfit: React.FC<CropYieldProfitProps> = ({
  language
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'recommend' | 'profit'>('profit');

  // Profit Calculator State
  const [crop, setCrop] = useState('Tomato (Hybrid F1)');
  const [areaAcres, setAreaAcres] = useState(2.0);
  const [seedCost, setSeedCost] = useState(8000);
  const [fertilizerCost, setFertilizerCost] = useState(14000);
  const [labourCost, setLabourCost] = useState(22000);
  const [irrigationCost, setIrrigationCost] = useState(5000);
  const [pesticideCost, setPesticideCost] = useState(9000);
  const [otherExpenses, setOtherExpenses] = useState(6000);
  const [expectedYieldQuintals, setExpectedYieldQuintals] = useState(280);
  const [expectedPricePerQuintal, setExpectedPricePerQuintal] = useState(2400);

  const [profitResult, setProfitResult] = useState<ProfitPredictionResult | null>({
    seedCost: 8000,
    fertilizerCost: 14000,
    labourCost: 22000,
    irrigationCost: 5000,
    pesticideCost: 9000,
    otherExpenses: 6000,
    totalCost: 64000,
    expectedYieldQuintals: 280,
    expectedPricePerQuintal: 2400,
    grossRevenue: 672000,
    netProfit: 608000,
    roiPercentage: 950.0,
    breakEvenYieldQuintals: 26.7
  });

  // Recommended Crops State
  const [recommendedCrops, setRecommendedCrops] = useState<CropRecommendationItem[]>([
    {
      crop: 'Tomato (Hybrid F1)',
      suitability: 94,
      season: 'Kharif / Rabi / Summer',
      waterRequirement: 'Medium (400-600 mm)',
      expectedYield: '140 - 180 Quintals/Acre',
      soilSuitability: 'Well-drained sandy loam to black clay with pH 6.0 - 7.5',
      cultivationGuide: 'Transplant 25-day seedlings with 90cm x 60cm spacing. Use silver-black mulching and drip fertigation.'
    },
    {
      crop: 'Chilli (Hot Pepper)',
      suitability: 89,
      season: 'Kharif & Late Rabi',
      waterRequirement: 'Low-Medium (350-500 mm)',
      expectedYield: '18 - 25 Quintals/Acre (Dry)',
      soilSuitability: 'Deep black and red soils with high organic matter',
      cultivationGuide: 'Optimum temperature 20-30°C. Protect from thrips and mites during flowering with yellow sticky traps.'
    },
    {
      crop: 'Cotton (Bt Hybrid)',
      suitability: 86,
      season: 'Kharif (June - Dec)',
      waterRequirement: 'Medium-High (700-1100 mm)',
      expectedYield: '12 - 16 Quintals/Acre (Kapas)',
      soilSuitability: 'Deep black cotton soil (Vertisols) with good moisture retention',
      cultivationGuide: 'Sow with 90cm x 45cm spacing after first monsoon showers. Top-dress nitrogen at square formation.'
    },
    {
      crop: 'Maize (Sweet Corn / Grain)',
      suitability: 88,
      season: 'All Seasons (Kharif, Rabi, Spring)',
      waterRequirement: 'Moderate (450-600 mm)',
      expectedYield: '28 - 36 Quintals/Acre',
      soilSuitability: 'Deep fertile loamy soil rich in organic matter',
      cultivationGuide: 'Requires adequate moisture at silking and grain filling stages. Highly responsive to NPK.'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const handleCalculateProfit = async () => {
    setLoading(true);
    try {
      const res = await apiService.predictProfit({
        crop,
        areaAcres,
        seedCost,
        fertilizerCost,
        labourCost,
        irrigationCost,
        pesticideCost,
        otherExpenses,
        expectedYieldQuintals,
        expectedPricePerQuintal
      });
      setProfitResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-amber-950 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-amber-300" />
              <span>Agri-Economics & Yield Optimization</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.profitPrediction}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'విత్తనాలు, ఎరువులు, కూలీ ఖర్చులు మరియు దిగుబడి అంచనాతో మీ నికర లాభం మరియు రాబడిని (ROI) లెక్కించండి.'
                : 'Calculate farm operational costs, expected mandi revenue, break-even yield, and ROI to maximize seasonal profitability.'}
            </p>
          </div>

          <div className="flex items-center bg-white/10 backdrop-blur p-1 rounded-xl border border-white/20">
            <button
              id="tab-profit-calc"
              onClick={() => setActiveTab('profit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'profit' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Profit & ROI Calculator</span>
            </button>
            <button
              id="tab-crop-rec"
              onClick={() => setActiveTab('recommend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'recommend' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Crop Suitability Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {activeTab === 'profit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Cost Ledger */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-emerald-600" />
                Farm Cost Ledger & Price Assumptions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmArea}</label>
                  <input
                    id="input-area-acres"
                    type="number"
                    step="0.5"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Yield (Quintals)</label>
                  <input
                    id="input-expected-yield"
                    type="number"
                    value={expectedYieldQuintals}
                    onChange={(e) => setExpectedYieldQuintals(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Mandi Market Price (₹ / Quintal)</label>
                <input
                  id="input-price-quintal"
                  type="number"
                  value={expectedPricePerQuintal}
                  onChange={(e) => setExpectedPricePerQuintal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-800"
                />
              </div>

              {/* Expense Breakdown Fields */}
              <div className="pt-2 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">Estimated Production Expenses (₹):</span>
                
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-600 mb-1 block">🌱 Seeds / Seedlings (₹)</label>
                    <input
                      type="number"
                      value={seedCost}
                      onChange={(e) => setSeedCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block">🧪 Fertilizers & NPK (₹)</label>
                    <input
                      type="number"
                      value={fertilizerCost}
                      onChange={(e) => setFertilizerCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block">👥 Labour & Harvesting (₹)</label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={(e) => setLabourCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block">💧 Drip / Irrigation Power (₹)</label>
                    <input
                      type="number"
                      value={irrigationCost}
                      onChange={(e) => setIrrigationCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block">🛡️ Pesticides & Bio-agents (₹)</label>
                    <input
                      type="number"
                      value={pesticideCost}
                      onChange={(e) => setPesticideCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 mb-1 block">📦 Packaging & Transport (₹)</label>
                    <input
                      type="number"
                      value={otherExpenses}
                      onChange={(e) => setOtherExpenses(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                id="btn-calculate-profit"
                onClick={handleCalculateProfit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                <span>Calculate Net Profit & ROI</span>
              </button>
            </div>
          </div>

          {/* Right Column: Financial Returns & ROI Dashboard */}
          <div className="lg:col-span-6 space-y-4">
            {profitResult && (
              <div 
                id="card-profit-results"
                className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Financial Summary & Returns
                  </h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    ROI: {profitResult.roiPercentage}%
                  </span>
                </div>

                {/* Big Profit Hero Metric */}
                <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    {t.netProfit}
                  </span>
                  <p className="text-4xl font-extrabold text-emerald-950 font-['Outfit'] my-1">
                    ₹ {profitResult.netProfit.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">
                    (₹ {Math.round(profitResult.netProfit / areaAcres).toLocaleString('en-IN')} / Acre Net Profit)
                  </p>
                </div>

                {/* Metrics 3-Card Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Total Investment</span>
                    <span className="text-sm font-bold text-slate-900 font-['Outfit']">
                      ₹ {profitResult.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Gross Revenue</span>
                    <span className="text-sm font-bold text-slate-900 font-['Outfit']">
                      ₹ {profitResult.grossRevenue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Break-even Yield</span>
                    <span className="text-sm font-bold text-amber-700 font-['Outfit']">
                      {profitResult.breakEvenYieldQuintals} Qtl
                    </span>
                  </div>
                </div>

                {/* Economics Advisory Notes */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Agri-Economist Strategy:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Stagger harvesting into 3 pickings to capitalize on peak mandi modal prices.</li>
                    <li>Grade produce into A-grade (for retail export) and B-grade (for processing).</li>
                    <li>Utilize precision drip fertigation to cut fertilizer waste by ₹1,850/acre.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Crop Suitability Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedCrops.map((c, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    {c.crop}
                  </h3>
                  <span className="text-xs text-slate-500">Season: {c.season}</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  {c.suitability}% Suitability
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Expected Yield</span>
                  <span className="font-bold text-slate-800">{c.expectedYield}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Water Requirement</span>
                  <span className="font-bold text-slate-800">{c.waterRequirement}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Soil:</strong> {c.soilSuitability}</p>
                <p><strong>Agronomy:</strong> {c.cultivationGuide}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
