import React, { useState } from 'react';
import { User } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import { X, Sprout, UserCheck, Shield, KeyRound, Phone, MapPin, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  language: 'en' | 'te';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  language
}) => {
  const t = translations[language];
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('farmer_ramesh');
  const [password, setPassword] = useState('farmer123');
  const [name, setName] = useState('Ramesh Patel');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Guntur, Andhra Pradesh');
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        const res = await apiService.register({
          username,
          password,
          name,
          phone,
          location,
          role
        });
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await apiService.login(username, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: 'farmer' | 'admin') => {
    if (demoRole === 'farmer') {
      setUsername('farmer_ramesh');
      setPassword('farmer123');
      setIsRegister(false);
    } else {
      setUsername('admin_agri');
      setPassword('admin123');
      setIsRegister(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id="modal-auth-container"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative">
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-emerald-300">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit']">
                {isRegister ? t.farmerRegister : t.farmerLogin}
              </h2>
              <p className="text-xs text-emerald-200">
                {language === 'te' ? 'AgriMind AI లోకి ప్రవేశించండి' : 'Access your autonomous smart farm dashboard'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Login Chips */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-col space-y-2">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-demo-farmer"
              type="button"
              onClick={() => handleQuickLogin('farmer')}
              className="flex items-center justify-center space-x-1.5 py-1.5 px-2.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-100/60 transition-colors shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Farmer (Ramesh)</span>
            </button>
            <button
              id="btn-demo-admin"
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center space-x-1.5 py-1.5 px-2.5 bg-white border border-teal-300 rounded-lg text-xs font-semibold text-teal-800 hover:bg-teal-100/60 transition-colors shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Agronomist (Admin)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmerName}</label>
                <input
                  id="input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="e.g. Ramesh Patel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.phoneNumber}</label>
                  <input
                    id="input-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t.farmLocation}</label>
                  <input
                    id="input-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    placeholder="Guntur, AP"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t.role}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      role === 'farmer'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                      role === 'admin'
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🔬 Agronomist / Admin
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.username}</label>
            <input
              id="input-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              placeholder="farmer_ramesh"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.password}</label>
            <input
              id="input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? t.register : t.login}
          </button>

          <div className="text-center pt-2">
            <button
              id="btn-toggle-auth-mode"
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-emerald-800 hover:underline font-semibold"
            >
              {isRegister
                ? (language === 'te' ? 'ఇప్పటికే ఖాతా ఉందా? లాగిన్ అవ్వండి' : 'Already registered? Login here')
                : (language === 'te' ? 'కొత్త రైతు ఖాతా నమోదు చేయండి →' : "Don't have an account? Register new farm →")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
