import React from 'react';
import { X, Satellite, Database, Activity, RefreshCw, ExternalLink } from 'lucide-react';
import { DataUpdateLog } from '../services/firmsApi';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface DataUpdatesDrawerProps {
  logs: DataUpdateLog[];
  lang: Language;
  lastUpdated?: Date;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onClose: () => void;
}

export const DataUpdatesDrawer: React.FC<DataUpdatesDrawerProps> = ({
  logs,
  lang,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onClose
}) => {
  const t = TRANSLATIONS[lang];

  const formatLastUpdated = (date?: Date) => {
    if (!date) return '';
    const minutesAgo = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (minutesAgo < 1) return lang === 'fr' ? 'À l\'instant' : 'Just now';
    return lang === 'fr'
      ? `Mis à jour il y a ${minutesAgo}m`
      : `Updated ${minutesAgo}m ago`;
  };

  return (
    <div className="absolute bottom-20 right-4 md:right-8 z-40 w-96 max-w-[calc(100vw-2rem)] flamap-glass rounded-2xl p-5 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-sm font-['Outfit']">
            <Activity className="w-4 h-4 text-orange-400" />
            <span>{t.dataUpdates}</span>
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              {formatLastUpdated(lastUpdated)} • {lang === 'fr' ? 'Auto 15m' : 'Auto 15m'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title={lang === 'fr' ? 'Rafraîchir' : 'Refresh Now'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.map((log, idx) => {
          const content = (
            <>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  {log.timestamp}
                </span>
                <div>
                  <strong className="text-white font-semibold block flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                    {log.satellite}
                    {log.url && <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />}
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {log.count} {log.type === 'hotspot' ? t.hotspotsDetected : t.perimetersFetched}
                  </span>
                </div>
              </div>
              <Satellite className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            </>
          );

          if (log.url) {
            return (
              <a
                key={`log-${idx}`}
                href={log.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/40 hover:bg-white/10 transition text-xs cursor-pointer"
              >
                {content}
              </a>
            );
          }

          return (
            <div
              key={`log-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition text-xs"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
