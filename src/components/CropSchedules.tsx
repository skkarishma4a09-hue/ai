import React, { useState } from 'react';
import { CropScheduleItem } from '../types';
import { translations } from '../translations';
import { apiService } from '../services/api';
import {
  Calendar,
  Plus,
  Droplets,
  Sprout,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Check,
  RotateCcw
} from 'lucide-react';

interface CropSchedulesProps {
  schedules: CropScheduleItem[];
  language: 'en' | 'te';
  onAddSchedule: (schedule: Partial<CropScheduleItem>) => Promise<void>;
  onUpdateStatus: (id: string, status: 'Pending' | 'Completed' | 'Postponed') => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
}

export const CropSchedules: React.FC<CropSchedulesProps> = ({
  schedules,
  language,
  onAddSchedule,
  onUpdateStatus,
  onDeleteSchedule
}) => {
  const t = translations[language];
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState<'irrigation' | 'spraying' | 'fertilizer' | 'harvest' | 'scouting'>('spraying');
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString().split('T')[0]);
  const [recommendedTime, setRecommendedTime] = useState('06:00 AM');
  const [frequency, setFrequency] = useState<'Once' | 'Daily' | 'Weekly' | 'Bi-weekly'>('Once');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;
    setLoading(true);
    try {
      await onAddSchedule({
        taskName,
        taskType,
        scheduledAt,
        recommendedTime,
        frequency,
        notes
      });
      setTaskName('');
      setNotes('');
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-300" />
              <span>Smart Crop Calendar & Spraying Schedule</span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit']">{t.cropSchedule}</h1>
            <p className="text-xs text-emerald-100/90 max-w-xl">
              {language === 'te'
                ? 'నీటిపారుదల, ఎరువులు మరియు పురుగుమందుల పిచికారీ షెడ్యూల్స్.'
                : 'Automated weather-aware spraying calendars and farm task tracking.'}
            </p>
          </div>

          <button
            id="btn-open-add-task-form"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Form Modal / Inline */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-3xl border border-emerald-200 shadow-lg space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
            Schedule New Farm Activity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Copper Oxychloride Spray"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Category</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              >
                <option value="spraying">🛡️ Pesticide / Bio-spray</option>
                <option value="irrigation">💧 Drip Irrigation</option>
                <option value="fertilizer">🌱 Fertilizer / Fertigation</option>
                <option value="harvest">🌾 Harvesting & Picking</option>
                <option value="scouting">🔍 Crop Field Scouting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recommended Time Window</label>
              <input
                type="text"
                value={recommendedTime}
                onChange={(e) => setRecommendedTime(e.target.value)}
                placeholder="e.g. 06:00 AM"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agronomic Dosage & Operational Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dosages, pump requirements, or special safety instructions..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              {loading ? 'Saving...' : 'Save Scheduled Task'}
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {schedules.map((task) => (
          <div
            key={task.id}
            id={`schedule-item-${task.id}`}
            className={`p-5 rounded-3xl border transition-all ${
              task.status === 'Completed'
                ? 'bg-slate-50 border-slate-200 opacity-75'
                : 'bg-white border-slate-200 shadow-xs hover:border-emerald-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl shrink-0 border border-emerald-100">
                  {task.taskType === 'irrigation' ? '💧' : task.taskType === 'spraying' ? '🛡️' : task.taskType === 'fertilizer' ? '🌱' : '🌾'}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {task.taskName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'Postponed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {task.scheduledAt}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.recommendedTime}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1.5 leading-relaxed">
                      {task.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {task.status !== 'Completed' ? (
                  <button
                    onClick={() => onUpdateStatus(task.id, 'Completed')}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateStatus(task.id, 'Pending')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reopen</span>
                  </button>
                )}

                <button
                  onClick={() => onDeleteSchedule(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
