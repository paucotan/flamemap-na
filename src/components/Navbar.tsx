import React, { useState } from 'react';
import { Search, Flame, ShieldAlert, Heart, Globe, ArrowUpRight, Settings, Clock, Share2, Check, Menu, X, Layers } from 'lucide-react';
import { UnitSystem, FireIncident, EvacuationAlert } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { TimezoneMode, getTimezoneBadgeLabel } from '../utils/timezone';

interface NavbarProps {
  unitSystem: UnitSystem;
  onToggleUnitSystem: () => void;
  lang: Language;
  onToggleLanguage: () => void;
  timezoneMode: TimezoneMode;
  onOpenSettings: () => void;
  incidents: FireIncident[];
  alerts: EvacuationAlert[];
  onSelectIncidentOrLocation: (item: { lat: number; lng: number; zoom?: number; name: string }) => void;
  onOpenCredits: () => void;
  onToggleEvacuations: () => void;
  showEvacuationDrawer: boolean;
  layers: { hotspots: boolean; perimeters: boolean; wind: boolean; evacuations: boolean; smoke: boolean };
  onToggleLayer: (layerName: 'hotspots' | 'perimeters' | 'wind' | 'evacuations' | 'smoke') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  unitSystem,
  onToggleUnitSystem,
  lang,
  onToggleLanguage,
  timezoneMode,
  onOpenSettings,
  incidents,
  alerts,
  onSelectIncidentOrLocation,
  onOpenCredits,
  onToggleEvacuations,
  showEvacuationDrawer,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tzBadge = getTimezoneBadgeLabel(timezoneMode);
  const caIncidents = incidents.filter(i => i.country === 'CA');
  const usIncidents = incidents.filter(i => i.country === 'US');

  const caTotalHa = caIncidents.reduce((sum, i) => sum + i.hectaresBurned, 0);
  const usTotalAcres = usIncidents.reduce((sum, i) => sum + i.acresBurned, 0);

  const formatNumber = (num: number) => num.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US');

  const handleShareMapLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const searchLocations = [
    { name: 'Clinton / Shetland Creek, BC (CA)', lat: 51.090, lng: -121.580, zoom: 10 },
    { name: 'Boston Bar / Fraser Canyon, BC (CA)', lat: 49.860, lng: -121.440, zoom: 10 },
    { name: 'Lytton, BC (CA)', lat: 50.230, lng: -121.570, zoom: 10 },
    { name: 'Jasper, Alberta (CA)', lat: 52.873, lng: -118.082, zoom: 9 },
    { name: 'Churchill Falls, NL (CA)', lat: 53.530, lng: -64.010, zoom: 9 },
    { name: 'Park Fire, California (US)', lat: 40.085, lng: -121.652, zoom: 9 },
    { name: 'Durkee Fire, Oregon (US)', lat: 44.421, lng: -117.452, zoom: 9 },
  ];

  const matchingIncidents = incidents.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.provinceOrState.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingLocations = searchLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-3 md:p-4 pointer-events-none flex flex-col md:flex-row md:items-center justify-between gap-2">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between gap-2 w-full md:w-auto pointer-events-auto">
        {/* Logo */}
        <div className="flamap-glass px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xl flex-shrink-0">
          <div className="flex items-center -space-x-1">
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ff3b30] shadow-[0_0_10px_#ff3b30] animate-pulse" />
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ff9500] shadow-[0_0_10px_#ff9500]" />
            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ffcc00] shadow-[0_0_8px_#ffcc00]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white font-['Outfit']">FlameMap</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Regional Burn Badges (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flamap-glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400 font-medium">{t.canadaTotal}</span>
            <span className="font-semibold text-slate-100">
              {unitSystem === 'metric'
                ? `${formatNumber(caTotalHa)} ha`
                : `${formatNumber(Math.round(caTotalHa * 2.47105))} acres`}
            </span>
          </div>
          <div className="flamap-glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400 font-medium">{t.usaTotal}</span>
            <span className="font-semibold text-slate-100">
              {unitSystem === 'metric'
                ? `${formatNumber(Math.round(usTotalAcres * 0.404686))} ha`
                : `${formatNumber(usTotalAcres)} acres`}
            </span>
          </div>
        </div>

        {/* Mobile Action Buttons (Search toggle & Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggleEvacuations}
            className={`flamap-glass p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
              showEvacuationDrawer || alerts.length > 0
                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                : 'text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            {alerts.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {alerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flamap-glass p-2 rounded-xl text-slate-200 hover:text-white border border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Bar Tools & Mobile Expandable Drawer */}
      <div className={`pointer-events-auto flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto ${
        mobileMenuOpen ? 'flex bg-[#0f1115]/95 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl mt-1' : 'hidden md:flex'
      }`}>
        {/* Search */}
        <div className="relative flex-1 md:w-56 lg:w-64">
          <div className="flamap-glass rounded-xl flex items-center px-3 py-2 border border-white/10 focus-within:border-orange-500/50 transition">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="bg-transparent text-xs text-white placeholder-slate-400 outline-none w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchResults && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-1.5 flamap-glass rounded-xl p-2 shadow-2xl max-h-64 overflow-y-auto border border-white/15 z-50">
              {matchingIncidents.length === 0 && matchingLocations.length === 0 ? (
                <div className="text-xs text-slate-400 p-2 text-center">{t.noResults}</div>
              ) : (
                <>
                  {matchingIncidents.map((inc) => (
                    <button
                      key={inc.id}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between text-slate-200 transition"
                      onClick={() => {
                        onSelectIncidentOrLocation({ lat: inc.latitude, lng: inc.longitude, zoom: 10, name: inc.name });
                        setShowSearchResults(false);
                        setSearchQuery('');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="font-medium text-white">{inc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{inc.provinceOrState} ({inc.country})</span>
                    </button>
                  ))}
                  {matchingLocations.map((loc) => (
                    <button
                      key={loc.name}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs flex items-center justify-between text-slate-300 transition"
                      onClick={() => {
                        onSelectIncidentOrLocation(loc);
                        setShowSearchResults(false);
                        setSearchQuery('');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>{loc.name}</span>
                      </div>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Share */}
          <button
            onClick={handleShareMapLink}
            className={`flex-1 md:flex-none justify-center flamap-glass px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-orange-400" />}
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          {/* Timezone Badge */}
          <div className="flex-1 md:flex-none justify-center flamap-glass px-2.5 py-2 rounded-xl text-xs font-semibold text-cyan-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{tzBadge}</span>
          </div>

          {/* Evacuation Desktop Button */}
          <button
            onClick={() => {
              onToggleEvacuations();
              setMobileMenuOpen(false);
            }}
            className={`hidden md:flex flamap-glass px-3 py-2 rounded-xl text-xs font-medium items-center gap-2 transition ${
              showEvacuationDrawer || alerts.length > 0
                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{t.evacuations}</span>
            <span className="bg-red-500/30 text-red-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {alerts.length}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="flamap-glass p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
            title="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Credits */}
          <button
            onClick={() => {
              onOpenCredits();
              setMobileMenuOpen(false);
            }}
            className="flamap-glass p-2.5 md:px-3 md:py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />
            <span className="hidden lg:inline">{t.sourcesCredits}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

