import React from 'react';
import { ShieldAlert, X, MapPin, Users, Clock, ExternalLink, Building2 } from 'lucide-react';
import { EvacuationAlert } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface EvacuationBannerProps {
  alerts: EvacuationAlert[];
  lang: Language;
  onClose: () => void;
  onSelectAlert: (alert: EvacuationAlert) => void;
}

export const EvacuationBanner: React.FC<EvacuationBannerProps> = ({
  alerts,
  lang,
  onClose,
  onSelectAlert,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="absolute top-20 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] flamap-glass rounded-2xl p-4 shadow-2xl border border-red-500/40">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-sm font-['Outfit']">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          <span>{t.evacuations} ({alerts.length})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const title = lang === 'fr' ? alert.titleFr : alert.titleEn;
          const summary = lang === 'fr' ? alert.summaryFr : alert.summaryEn;

          return (
            <div
              key={alert.id}
              className="flamap-glass-card p-3.5 rounded-xl border border-white/10 hover:border-red-500/50 transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  alert.type === 'Order'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/50'
                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}>
                  {alert.type === 'Order' ? t.evacuateNow : t.evacAlert}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h4
                onClick={() => onSelectAlert(alert)}
                className="text-xs font-semibold text-white group-hover:text-red-300 transition mb-1 leading-snug cursor-pointer"
              >
                {title}
              </h4>

              <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                {summary}
              </p>

              {/* Official Authority Badge & Link Button */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Building2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{alert.authorityName}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-amber-400">
                    <Users className="w-3 h-3" />
                    <span>~{alert.affectedPopulationApprox.toLocaleString()} {t.affectedResidents}</span>
                  </div>

                  <a
                    href={alert.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300 hover:text-white bg-red-500/20 hover:bg-red-500/40 px-2.5 py-1 rounded-lg border border-red-500/30 transition shadow-sm"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
