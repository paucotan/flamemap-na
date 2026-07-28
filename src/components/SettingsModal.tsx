import React from 'react';
import { X, Settings, Clock, Globe, Scale, Check } from 'lucide-react';
import { UnitSystem } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { TimezoneMode, getDetectedTimezone } from '../utils/timezone';

interface SettingsModalProps {
  unitSystem: UnitSystem;
  onSelectUnitSystem: (system: UnitSystem) => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  timezoneMode: TimezoneMode;
  onSelectTimezoneMode: (tz: TimezoneMode) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  unitSystem,
  onSelectUnitSystem,
  lang,
  onSelectLanguage,
  timezoneMode,
  onSelectTimezoneMode,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const detectedTz = getDetectedTimezone();

  const timezoneOptions: { mode: TimezoneMode; label: string; sub: string }[] = [
    { mode: 'auto', label: 'Auto-Detect Local Timezone', sub: detectedTz },
    { mode: 'UTC', label: 'UTC (Coordinated Universal Time)', sub: 'UTC' },
    { mode: 'America/Vancouver', label: 'Pacific Time (PT)', sub: 'America/Vancouver' },
    { mode: 'America/Denver', label: 'Mountain Time (MT)', sub: 'America/Denver' },
    { mode: 'America/Chicago', label: 'Central Time (CT)', sub: 'America/Chicago' },
    { mode: 'America/New_York', label: 'Eastern Time (ET)', sub: 'America/New_York' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="flamap-glass rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-white/15 flex items-center justify-center shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">Settings & Preferences</h3>
            <p className="text-xs text-slate-400">Customize timezone, units, and language</p>
          </div>
        </div>

        {/* 1. Timezone Settings */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Timezone Preference</span>
          </label>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {timezoneOptions.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => onSelectTimezoneMode(opt.mode)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                  timezoneMode === opt.mode
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white font-semibold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-medium text-slate-100">{opt.label}</div>
                  <div className="text-[10px] text-slate-400">{opt.sub}</div>
                </div>
                {timezoneMode === opt.mode && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Language Settings */}
        <div className="mb-5 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>Language / Langue</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                lang === 'en'
                  ? 'bg-orange-500/20 border-orange-500/50 text-white'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>English (EN)</span>
              {lang === 'en' && <Check className="w-4 h-4 text-orange-400" />}
            </button>

            <button
              onClick={() => onSelectLanguage('fr')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                lang === 'fr'
                  ? 'bg-orange-500/20 border-orange-500/50 text-white'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Français (FR)</span>
              {lang === 'fr' && <Check className="w-4 h-4 text-orange-400" />}
            </button>
          </div>
        </div>

        {/* 3. Unit System Settings */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Measurement Units</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectUnitSystem('metric')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                unitSystem === 'metric'
                  ? 'bg-amber-500/20 border-amber-500/50 text-white'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-medium">Metric</div>
                <div className="text-[10px] text-slate-400">ha / km/h</div>
              </div>
              {unitSystem === 'metric' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => onSelectUnitSystem('imperial')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                unitSystem === 'imperial'
                  ? 'bg-amber-500/20 border-amber-500/50 text-white'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-medium">Imperial</div>
                <div className="text-[10px] text-slate-400">acres / mph</div>
              </div>
              {unitSystem === 'imperial' && <Check className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-semibold text-xs text-white transition shadow-lg shadow-orange-500/25"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
