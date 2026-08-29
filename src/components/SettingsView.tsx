import React, { useState } from 'react';
import { User, Farm, Crop } from '../types';
import { translations } from '../translations';
import {
  Settings,
  Bell,
  Volume2,
  Radio,
  Sprout,
  Shield,
  Save,
  CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  user: User | null;
  farm: Farm | null;
  crop: Crop | null;
  language: 'en' | 'te';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSaveFarmSettings: (farmData: any) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  farm,
  crop,
  language,
  soundEnabled,
  onToggleSound,
  onSaveFarmSettings
}) => {
  const t = translations[language];
  const [farmName, setFarmName] = useState(farm?.name || 'Sri Krishna Organic Farms');
  const [location, setLocation] = useState(farm?.location || 'Guntur, Andhra Pradesh');
  const [areaAcres, setAreaAcres] = useState(farm?.totalAreaAcres || 3.5);
  const [soilType, setSoilType] = useState(farm?.soilType || 'Black Clay Loam (Regur)');
  const [irrigationType, setIrrigationType] = useState(farm?.irrigationType || 'Drip');
  
  const [rainAlerts, setRainAlerts] = useState(true);
  const [irrigationAlerts, setIrrigationAlerts] = useState(true);
  const [diseaseAlerts, setDiseaseAlerts] = useState(true);
  const [fertilizerAlerts, setFertilizerAlerts] = useState(true);
  const [harvestAlerts, setHarvestAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveFarmSettings({
        name: farmName,
        location,
        totalAreaAcres: areaAcres,
        soilType,
        irrigationType
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
            <Settings className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farm Profile & Notification Preferences</span>
          </div>
          <h1 className="text-2xl font-bold font-['Outfit']">{t.settings}</h1>
          <p className="text-xs text-emerald-100/90 max-w-xl">
            Configure field coordinates, soil types, autonomous alarm sensitivities, and push notification triggers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Farm Profile Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center">
                <Sprout className="w-4 h-4 mr-2 text-emerald-600" />
                Farm & Field Configuration
              </h3>
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Saved!
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmName}</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmLocation}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmArea}</label>
                <input
                  type="number"
                  step="0.5"
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.soilType}</label>
                <input
                  type="text"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.irrigationType}</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                >
                  <option value="Drip">Drip Irrigation (Micro-drip)</option>
                  <option value="Sprinkler">Sprinkler System</option>
                  <option value="Flood">Flood / Basin Irrigation</option>
                  <option value="Furrow">Furrow Irrigation</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Updating Farm Profile...' : 'Save Farm Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Notification Channels & Alert Toggles */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit'] flex items-center">
              <Bell className="w-4 h-4 mr-2 text-emerald-600" />
              Automated Alert Triggers
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">🌧️ Weather & Rain Alerts</span>
                  <p className="text-[11px] text-slate-500">Alerts when rain &gt;10mm or high winds are forecasted</p>
                </div>
                <input
                  type="checkbox"
                  checked={rainAlerts}
                  onChange={(e) => setRainAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">💧 Smart Irrigation Alarms</span>
                  <p className="text-[11px] text-slate-500">Triggered when soil moisture drops below crop threshold</p>
                </div>
                <input
                  type="checkbox"
                  checked={irrigationAlerts}
                  onChange={(e) => setIrrigationAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">🦠 Disease & Spore Warnings</span>
                  <p className="text-[11px] text-slate-500">Alerts for high nighttime humidity and fungal risk</p>
                </div>
                <input
                  type="checkbox"
                  checked={diseaseAlerts}
                  onChange={(e) => setDiseaseAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">🌱 Fertilizer & Fertigation Reminders</span>
                  <p className="text-[11px] text-slate-500">Growth stage nutrient top-dressing notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={fertilizerAlerts}
                  onChange={(e) => setFertilizerAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800">🔊 Audio Siren & Sound Chimes</span>
                  <p className="text-[11px] text-slate-500">Play web audio notification sound on high priority alerts</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={onToggleSound}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
