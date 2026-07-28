import React from 'react';
import { X, Flame, MapPin, ExternalLink, ShieldCheck, LifeBuoy, AlertTriangle } from 'lucide-react';
import { FireIncident, UnitSystem } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { formatTimestampWithTimezone } from '../utils/timezone';

interface IncidentDetailModalProps {
  incident: FireIncident;
  unitSystem: UnitSystem;
  lang: Language;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  unitSystem,
  lang,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];

  const areaDisplay = unitSystem === 'metric'
    ? `${incident.hectaresBurned.toLocaleString()} ha`
    : `${incident.acresBurned.toLocaleString()} acres`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="flamap-glass rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
          <span className="text-xs uppercase font-bold tracking-wider text-red-400">
            {incident.status} Fire Incident
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{incident.name}</h3>

        <div className="flex items-center gap-2 text-xs text-slate-300 mb-5">
          <MapPin className="w-4 h-4 text-orange-400" />
          <span>{incident.provinceOrState}, {incident.country === 'CA' ? 'Canada' : 'United States'}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flamap-glass-card p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-medium block mb-1">{t.burnedArea}</span>
            <span className="text-lg font-bold text-white font-['Outfit']">{areaDisplay}</span>
          </div>

          <div className="flamap-glass-card p-3 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-medium block mb-1">{t.containment}</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-emerald-400 font-['Outfit']">
                {incident.containmentPercentage}%
              </span>
              <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${incident.containmentPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2 text-xs text-slate-300 mb-4 bg-white/5 p-3.5 rounded-2xl border border-white/5">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">{t.agency}:</span>
            <span className="font-semibold text-slate-200">{incident.agency}</span>
          </div>
          {incident.cause && (
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">{t.cause}:</span>
              <span className="font-semibold text-slate-200">{incident.cause}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{t.lastUpdate}:</span>
            <span className="font-semibold text-slate-200">
              {formatTimestampWithTimezone(incident.updatedAt, 'auto', lang === 'fr' ? 'fr-FR' : 'en-US')}
            </span>
          </div>
        </div>

        {/* Official Agency Bulletin Button */}
        {incident.officialBulletinUrl && (
          <a
            href={incident.officialBulletinUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-orange-500/20 hover:bg-orange-500/35 text-orange-300 border border-orange-500/40 font-semibold text-xs transition flex items-center justify-center gap-2 mb-4 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span>{t.officialBulletin}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto" />
          </a>
        )}

        {/* Emergency & Safety Guidelines Box */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl mb-5">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs mb-1">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>{t.safetyGuidelineTitle}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {t.safetyGuidelineText}
          </p>
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
