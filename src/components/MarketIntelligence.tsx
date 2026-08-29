import React, { useState } from 'react';
import { MarketPrice } from '../types';
import { translations } from '../translations';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Store,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface MarketIntelligenceProps {
  markets: MarketPrice[];
  language: 'en' | 'te';
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({
  markets,
  language
}) => {
  const t = translations[language];
  const [selectedCrop, setSelectedCrop] = useState('All');

  const filteredMarkets = selectedCrop === 'All'
    ? markets
    : markets.filter(m => m.crop.toLowerCase().includes(selectedCrop.toLowerCase()));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Store className="w-3.5 h-3.5 text-emerald-300" />
              <span>APMC Live Mandi Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.marketPrices}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'తాజా మార్కెట్ ధరలు, ధరల హెచ్చుతగ్గులు మరియు అమ్మకానికి ఉత్తమ సమయాన్ని తెలుసుకోండి.'
                : 'Real-time APMC Mandi prices, 7-day modal price trends, and price advisories for agricultural commodities.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-white/10 backdrop-blur p-1 rounded-xl border border-white/20 text-xs font-bold">
            {['All', 'Tomato', 'Cotton', 'Chilli', 'Paddy'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCrop === c ? 'bg-white text-emerald-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map((m) => (
          <div
            key={m.id}
            id={`market-card-${m.id}`}
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  {m.marketName} ({m.state})
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] mt-0.5">
                  {m.crop}
                </h3>
              </div>

              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                m.priceTrend === 'rising'
                  ? 'bg-emerald-100 text-emerald-800'
                  : m.priceTrend === 'falling'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {m.priceTrend === 'rising' && <TrendingUp className="w-3 h-3 mr-1" />}
                {m.priceTrend === 'falling' && <TrendingDown className="w-3 h-3 mr-1" />}
                {m.priceTrend === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                {m.priceChangePercent > 0 ? `+${m.priceChangePercent}%` : `${m.priceChangePercent}%`}
              </span>
            </div>

            {/* Current Modal Price */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-baseline justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-medium">Modal Price</span>
                <p className="text-2xl font-extrabold text-emerald-950 font-['Outfit']">
                  ₹ {m.modalPrice.toLocaleString('en-IN')}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">per Quintal</span>
            </div>

            {/* Min / Max Range */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-400 block text-[10px]">Min Price</span>
                <span className="font-bold text-slate-700">₹ {m.minPrice}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-slate-400 block text-[10px]">Max Price</span>
                <span className="font-bold text-emerald-700">₹ {m.maxPrice}</span>
              </div>
            </div>

            {/* 7-Day Sparkline Visual */}
            {m.historicalPrices && m.historicalPrices.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1.5">
                  7-Day Price Trajectory
                </span>
                <div className="flex items-end space-x-1.5 h-12 pt-1">
                  {m.historicalPrices.map((hp, i) => {
                    const min = Math.min(...m.historicalPrices.map(p => p.price));
                    const max = Math.max(...m.historicalPrices.map(p => p.price));
                    const heightPercent = max > min ? Math.max(20, Math.round(((hp.price - min) / (max - min)) * 100)) : 60;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div
                          className="w-full bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all"
                          style={{ height: `${heightPercent}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-7 hidden group-hover:block bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                          ₹{hp.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
