import React, { useState } from 'react';
import { DiseasePredictionResult, PestPredictionResult, FruitAnalysisResult } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  Camera,
  Upload,
  Sparkles,
  Bug,
  Apple,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Info,
  HelpCircle,
  Pill,
  Leaf
} from 'lucide-react';

interface CropVisionAIProps {
  language: 'en' | 'te';
  onAddNotification?: (item: any) => void;
}

export const CropVisionAI: React.FC<CropVisionAIProps> = ({
  language
}) => {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'disease' | 'pest' | 'fruit'>('disease');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<DiseasePredictionResult | null>(null);
  const [pestResult, setPestResult] = useState<PestPredictionResult | null>(null);
  const [fruitResult, setFruitResult] = useState<FruitAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample Images to test instantly with 1 click
  const sampleDiagnoses = [
    {
      title: 'Tomato Early Blight Leaf',
      crop: 'Tomato',
      tab: 'disease' as const,
      hint: 'blight',
      badge: 'Fungal Spot',
      svgColor: '#e11d48'
    },
    {
      title: 'Tomato Leaf Curl Virus',
      crop: 'Tomato',
      tab: 'disease' as const,
      hint: 'curl',
      badge: 'Viral Vector',
      svgColor: '#ea580c'
    },
    {
      title: 'Healthy Green Tomato Leaf',
      crop: 'Tomato',
      tab: 'disease' as const,
      hint: 'healthy',
      badge: 'Healthy',
      svgColor: '#16a34a'
    },
    {
      title: 'Tomato Fruit Borer Pest',
      crop: 'Tomato',
      tab: 'pest' as const,
      hint: 'borer',
      badge: 'Larval Pest',
      svgColor: '#d97706'
    },
    {
      title: 'Ripe Harvesting Tomato',
      crop: 'Tomato',
      tab: 'fruit' as const,
      hint: 'ripe',
      badge: 'Optimal Harvest',
      svgColor: '#dc2626'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async (customHint?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (activeSubTab === 'disease') {
        const res = await apiService.predictDisease({
          cropName: selectedCrop,
          imageBase64: imagePreview || undefined,
          symptomsHint: customHint || 'Tomato leaf lesions'
        });
        setDiseaseResult(res);
      } else if (activeSubTab === 'pest') {
        const res = await apiService.predictPest({
          cropName: selectedCrop,
          imageBase64: imagePreview || undefined
        });
        setPestResult(res);
      } else {
        const res = await apiService.analyzeFruit({
          fruitTypeHint: selectedCrop,
          imageBase64: imagePreview || undefined
        });
        setFruitResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Vision AI diagnosis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleDiagnoses[0]) => {
    setActiveSubTab(sample.tab);
    setSelectedCrop(sample.crop);
    setImagePreview(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><circle cx="200" cy="150" r="80" fill="${encodeURIComponent(sample.svgColor)}" opacity="0.8"/><text x="200" y="155" font-family="sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="bold">${sample.title}</text></svg>`);
    handleRunAnalysis(sample.hint);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5 text-emerald-300" />
              <span>Deep Learning Crop Vision AI</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.plantDiseaseDetection}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'పంట ఆకు ఫోటో అప్‌లోడ్ చేసి క్షణాల్లో తెగుళ్లు, పురుగులు మరియు పండ్ల పక్వతను తెలుసుకోండి.'
                : 'Upload leaf or crop photos for instant disease pathology, chemical dosages, organic remedies, and pest management.'}
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center bg-white/10 backdrop-blur p-1 rounded-xl border border-white/20">
            <button
              id="tab-disease"
              onClick={() => { setActiveSubTab('disease'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'disease' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Leaf Disease</span>
            </button>
            <button
              id="tab-pest"
              onClick={() => { setActiveSubTab('pest'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'pest' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Pest ID</span>
            </button>
            <button
              id="tab-fruit"
              onClick={() => { setActiveSubTab('fruit'); setError(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'fruit' ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>Fruit Ripeness</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Instant Sample Chips */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Quick Test with Real Crop Samples (1-Click Diagnostics):
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleDiagnoses.map((sample, i) => (
            <button
              key={i}
              id={`sample-chip-${i}`}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-800 hover:bg-emerald-100/50 transition-all flex items-center space-x-2 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sample.svgColor }} />
              <span>{sample.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-bold">
                {sample.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload Box & Crop Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Crop Type
              </label>
              <select
                id="select-vision-crop"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tomato">Tomato (టమాట)</option>
                <option value="Cotton">Cotton / Kapas (పత్తి)</option>
                <option value="Chilli">Chilli / Mirchi (మిరప)</option>
                <option value="Paddy">Paddy / Rice (వరి)</option>
                <option value="Maize">Maize / Corn (మొక్కజొన్న)</option>
                <option value="Onion">Onion (ఉల్లి)</option>
              </select>
            </div>

            {/* Drag and drop upload box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Plant / Leaf / Fruit Image
              </label>
              
              <div className="relative border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-2xl p-6 text-center transition-colors">
                <input
                  id="input-file-vision"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Uploaded crop"
                      className="max-h-48 mx-auto rounded-xl shadow-xs object-contain border border-slate-200"
                    />
                    <p className="text-xs text-emerald-700 font-semibold">
                      Click or drop new photo to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 mx-auto bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {t.dragDropImage}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supports JPG, PNG, WebP up to 15MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Diagnostics Button */}
            <button
              id="btn-run-diagnosis"
              onClick={() => handleRunAnalysis()}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running AI Vision Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Diagnose with Vision AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Prescription & Diagnostic Report */}
        <div className="lg:col-span-7">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Disease Diagnosis Result */}
          {activeSubTab === 'disease' && (
            diseaseResult ? (
              <div id="card-disease-result" className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        diseaseResult.severity.toLowerCase().includes('healthy') || diseaseResult.severity === 'None (Healthy)'
                          ? 'bg-emerald-100 text-emerald-800'
                          : diseaseResult.severity === 'Severe'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Severity: {diseaseResult.severity}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {diseaseResult.confidence}% Confidence
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] mt-1.5">
                      {diseaseResult.diseaseName}
                    </h2>
                  </div>

                  <span className="text-xs text-slate-400">
                    Diagnosed on {new Date(diseaseResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Symptoms Identified */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1 text-sky-600" />
                    Key Symptoms Detected:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {diseaseResult.symptoms.map((s, idx) => (
                      <li key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Treatment Prescription */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                    <Pill className="w-4 h-4 text-amber-600" />
                    <span>Chemical Treatment & Dosage</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {diseaseResult.treatmentChemical}
                  </p>
                </div>

                {/* Organic / Biological Alternative */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Organic & Biological Solution</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {diseaseResult.treatmentOrganic}
                  </p>
                </div>

                {/* Prevention Checklist & Expert Safety Note */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Preventive Farm Management:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {diseaseResult.preventionTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                  {diseaseResult.expertWarning && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-start space-x-1.5 text-amber-800 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{diseaseResult.expertWarning}</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Leaf className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Ready for Pathology Diagnosis</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a sample above or upload a crop leaf picture to receive a complete pathology breakdown with chemical and organic treatments.
                </p>
              </div>
            )
          )}

          {/* Pest Result */}
          {activeSubTab === 'pest' && (
            pestResult ? (
              <div id="card-pest-result" className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Severity: {pestResult.severity}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] mt-1.5">
                      {pestResult.pestName}
                    </h2>
                    {pestResult.scientificName && (
                      <p className="text-xs text-slate-500 italic">Scientific: {pestResult.scientificName}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {pestResult.confidence}% Match
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-800">Damage Pattern:</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {pestResult.damageType}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-emerald-900">Biological / Trap Control</span>
                    <p className="text-xs text-slate-700">{pestResult.biologicalControl}</p>
                  </div>
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-amber-900">Chemical Spraying</span>
                    <p className="text-xs text-slate-700">{pestResult.chemicalControl}</p>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 font-medium">
                  🔍 <strong>Scouting Advice:</strong> {pestResult.scoutingAdvice}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-16 h-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <Bug className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Pest Identification Engine</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload an insect, caterpillar, or leaf puncture photo to identify the pest and biological parasitoid controls.
                </p>
              </div>
            )
          )}

          {/* Fruit Ripeness Result */}
          {activeSubTab === 'fruit' && (
            fruitResult ? (
              <div id="card-fruit-result" className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      fruitResult.ripeness === 'Ripe' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Stage: {fruitResult.ripeness}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] mt-1.5">
                      {fruitResult.fruitName} ({fruitResult.ripeness})
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {fruitResult.confidence}% Accuracy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500">Estimated Shelf Life</span>
                    <p className="text-xl font-bold text-slate-900 font-['Outfit']">{fruitResult.shelfLifeDays} Days</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                    <span className="text-xs text-slate-500">Sugar Content (°Brix)</span>
                    <p className="text-xl font-bold text-slate-900 font-['Outfit']">{fruitResult.sugarContentBrixEstimate || 5.0}°</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-900">Harvesting Timing Advisory</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{fruitResult.harvestRecommendation}</p>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900">
                  ❄️ <strong>Cold Chain & Storage:</strong> {fruitResult.storageTemperature}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-16 h-16 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                  <Apple className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Fruit Ripeness & Shelf Life Classifier</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Check if your produce is ready for harvesting, distant transport, or local mandi sales.
                </p>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
};
