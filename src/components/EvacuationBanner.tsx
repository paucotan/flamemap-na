import React, { useState } from 'react';
import { ShieldAlert, X, MapPin, Users, Clock, ExternalLink, Building2, RefreshCw, CheckCircle2 } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date());
      setIsRefreshing(false);
    }, 800);
  };

  const getRelativeTimeText = (dateString: string) => {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return 'Recently';

    const diffMinutes = Math.floor((new Date().getTime() - parsedDate.getTime()) / 60000);
    if (diffMinutes < 0) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const hours = Math.floor(diffMinutes / 60);
    if (hours < 48) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'alerts' | 'roads'>('all');

  // Filter & sort alerts chronologically: Most recent emergency notifications first
  const filteredAlerts = alerts.filter(alert => {
    const isRoad = alert.titleEn.includes('ROAD CLOSURE') || alert.authorityName.includes('DriveBC');
    if (activeTab === 'orders') return alert.type === 'Order' && !isRoad;
    if (activeTab === 'alerts') return alert.type === 'Warning' && !isRoad;
    if (activeTab === 'roads') return isRoad;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const timeA = new Date(a.issuedAt).getTime() || 0;
    const timeB = new Date(b.issuedAt).getTime() || 0;
    return timeB - timeA;
  });

  const countOrders = alerts.filter(a => a.type === 'Order' && !a.titleEn.includes('ROAD CLOSURE') && !a.authorityName.includes('DriveBC')).length;
  const countAlerts = alerts.filter(a => a.type === 'Warning' && !a.titleEn.includes('ROAD CLOSURE') && !a.authorityName.includes('DriveBC')).length;
  const countRoads = alerts.filter(a => a.titleEn.includes('ROAD CLOSURE') || a.authorityName.includes('DriveBC')).length;

  return (
    <div className="absolute top-16 sm:top-20 right-2 sm:right-4 z-40 w-96 max-w-[calc(100vw-1rem)] flamap-glass rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-red-500/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-sm font-['Outfit']">
          <ShieldAlert className="w-5 h-5 animate-pulse flex-shrink-0" />
          <span>{t.evacuations} ({alerts.length})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1 text-[10px]"
            title="Check official emergency feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs (All, Orders, Alerts, Roads) */}
      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 mb-2.5">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'all' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>All</span>
          <span className="text-[9px] opacity-75">({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'orders' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🚨 Orders</span>
          <span className="text-[9px] opacity-75">({countOrders})</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'alerts' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚠️ Alerts</span>
          <span className="text-[9px] opacity-75">({countAlerts})</span>
        </button>

        <button
          onClick={() => setActiveTab('roads')}
          className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'roads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🚧 Roads</span>
          <span className="text-[9px] opacity-75">({countRoads})</span>
        </button>
      </div>

      {/* Live Feed Status Bar */}
      <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[10px] gap-2">
        <div className="flex items-center gap-1.5 text-emerald-300 font-medium overflow-hidden flex-1 relative">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 z-10 bg-[#0f1115]/80 rounded-full" />
          <div className="overflow-hidden w-full relative">
            <div className="whitespace-nowrap animate-[marquee_12s_linear_infinite] hover:[animation-play-state:paused] inline-block">
              <span>Live Emergency Feeds (DriveBC, Emergency Info BC, CAL FIRE, NIFC) • </span>
              <span>Live Emergency Feeds (DriveBC, Emergency Info BC, CAL FIRE, NIFC) • </span>
            </div>
          </div>
        </div>
        <span className="text-slate-400 flex-shrink-0 font-mono text-[9px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
          Sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto pr-1">
        {sortedAlerts.map((alert) => {
          const title = lang === 'fr' ? alert.titleFr : alert.titleEn;
          const summary = lang === 'fr' ? alert.summaryFr : alert.summaryEn;

          return (
            <div
              key={alert.id}
              className="flamap-glass-card p-3 rounded-xl border border-white/10 hover:border-red-500/50 transition group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  alert.type === 'Order'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/50'
                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}>
                  {alert.type === 'Order' ? t.evacuateNow : t.evacAlert}
                </span>
                <span className="text-[10px] text-red-300 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-red-400" />
                  {getRelativeTimeText(alert.issuedAt)} ({new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
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
                    <span>{alert.authorityName.includes('DriveBC') ? 'DriveBC Event' : 'Official Portal'}</span>
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

