import React from 'react';
import { X, Satellite, Database, Activity } from 'lucide-react';
import { DataUpdateLog } from '../services/firmsApi';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface DataUpdatesDrawerProps {
  logs: DataUpdateLog[];
  lang: Language;
  onClose: () => void;
}

export const DataUpdatesDrawer: React.FC<DataUpdatesDrawerProps> = ({ logs, lang, onClose }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="absolute bottom-20 right-4 md:right-8 z-40 w-96 max-w-[calc(100vw-2rem)] flamap-glass rounded-2xl p-5 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm font-['Outfit']">
          <Activity className="w-4 h-4 text-orange-400" />
          <span>{t.dataUpdates}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.map((log, idx) => (
          <div
            key={`log-${idx}`}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/15 transition text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-400 font-mono">
                {log.timestamp}
              </span>
              <div>
                <strong className="text-white font-semibold block">{log.satellite}</strong>
                <span className="text-[11px] text-slate-400">
                  {log.count} {log.type === 'hotspot' ? t.hotspotsDetected : t.perimetersFetched}
                </span>
              </div>
            </div>
            <Satellite className="w-3.5 h-3.5 text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
};
