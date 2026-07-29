import React, { useState } from 'react';
import { Play, Pause, Compass, Info, Flame, Eye, Wind, CloudFog, Layers, ChevronUp, ChevronDown, Activity, Globe2, Map } from 'lucide-react';
import { UnitSystem, ViewportWind } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { TimezoneMode, formatTimestampWithTimezone } from '../utils/timezone';

export type MapStyleMode = 'satellite' | 'dark' | 'topo';

interface TimelineControlProps {
  currentAgeHours: number;
  onChangeAgeHours: (age: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  unitSystem: UnitSystem;
  lang: Language;
  timezoneMode: TimezoneMode;
  viewportWind?: ViewportWind;
  mapStyle: MapStyleMode;
  onSelectMapStyle: (style: MapStyleMode) => void;
  layers: { hotspots: boolean; perimeters: boolean; wind: boolean; evacuations: boolean; smoke: boolean; airQuality: boolean };
  onToggleLayer: (layerName: 'hotspots' | 'perimeters' | 'wind' | 'evacuations' | 'smoke' | 'airQuality') => void;
  onToggleDataUpdates: () => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  currentAgeHours,
  onChangeAgeHours,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  unitSystem,
  lang,
  timezoneMode,
  viewportWind,
  mapStyle,
  onSelectMapStyle,
  layers,
  onToggleLayer,
  onToggleDataUpdates,
}) => {
  const t = TRANSLATIONS[lang];
  const [showLayersMobile, setShowLayersMobile] = useState(false);
  const [showLegendMobile, setShowLegendMobile] = useState(false);

  const baseDate = new Date('2026-07-28T17:46:00Z');
  const activeDate = new Date(baseDate.getTime() - currentAgeHours * 3600 * 1000);

  const formattedDateString = formatTimestampWithTimezone(
    activeDate,
    timezoneMode,
    lang === 'fr' ? 'fr-FR' : 'en-US'
  );

  const compassRotation = viewportWind?.directionDegrees || 225;

  const getCardinalDirection = (deg: number): string => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[val % 16];
  };

  const cardinalDir = getCardinalDirection(compassRotation);

  const speedDisplay = unitSystem === 'metric'
    ? `${cardinalDir} ${viewportWind?.speedKmh || 22} km/h`
    : `${cardinalDir} ${viewportWind?.speedMph || 14} mph`;

  const gustDisplay = unitSystem === 'metric'
    ? `(raf. ${viewportWind?.gustKmh || 32} km/h)`
    : `(gust ${viewportWind?.gustMph || 20} mph)`;

  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (currentAgeHours <= 0) {
        onChangeAgeHours(120);
      } else {
        onChangeAgeHours(Math.max(0, currentAgeHours - 1 * playbackSpeed));
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentAgeHours, onChangeAgeHours]);

  const histogramBars = [
    12, 18, 25, 40, 32, 20, 15, 28, 65, 80, 95, 110, 75, 45, 30, 22, 48, 85, 120, 90, 60, 40, 70, 100
  ];

  return (
    <div className="absolute bottom-3 sm:bottom-7 left-2 sm:left-4 right-2 sm:right-4 z-30 pointer-events-none flex flex-col md:flex-row items-stretch md:items-end justify-between gap-2.5 sm:gap-4">
      {/* Mobile Floating Drawer Popups (Legend or Layers - Positioned cleanly above controls) */}
      <div className="pointer-events-auto w-full md:hidden">
        {showLegendMobile && (
          <div className="flamap-glass p-3 rounded-2xl w-full border border-white/20 shadow-2xl mb-2 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-white/10">
              <button
                onClick={() => onToggleLayer('airQuality')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  layers.airQuality ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Air Quality</span>
              </button>
              <button
                onClick={() => {
                  if (layers.airQuality) onToggleLayer('airQuality');
                  if (!layers.hotspots) onToggleLayer('hotspots');
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  !layers.airQuality ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm border border-amber-500/50 bg-[#1c1917]" />
                <span>Burned Area</span>
              </button>
            </div>

            {layers.airQuality ? (
              <>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">US EPA / EC Scale</span>
                  <span className="text-[10px] text-slate-400">AQI / AQHI</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 rounded-full w-full bg-gradient-to-r from-[#38bdf8] via-[#22c55e] via-[#eab308] via-[#f97316] to-[#e11d48]" />
                  <div className="flex justify-between text-[10px] text-slate-300 font-medium px-0.5">
                    <span className="text-sky-400 font-semibold">Good (0-50)</span>
                    <span className="text-yellow-400 font-semibold">Moderate</span>
                    <span className="text-rose-400 font-semibold">Hazardous (200+)</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">{t.burnedArea}</span>
                  <span className="text-[10px] text-slate-400">effis / cwfis</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full w-full bg-gradient-to-r from-[#451a03] via-[#ef4444] to-[#ffcc00]" />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                    <span>{t.daysAgo(5)}</span>
                    <span>24 h</span>
                    <span className="text-amber-400 font-semibold">{t.justNow}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top Floating Controls on Mobile (Wind, Legend Toggle, Layers Toggle) */}
      <div className="pointer-events-auto flex items-center justify-between md:flex-col md:items-start gap-2">
        {/* Dynamic Viewport Wind Status Badge */}
        <div className="flamap-glass px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs flex items-center gap-2 text-slate-200 shadow-xl">
          <Compass
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 transition-transform duration-500 flex-shrink-0"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          />
          <span className="font-semibold text-white text-xs">
            {speedDisplay}
          </span>
          <span className="text-slate-400 text-[10px] sm:text-[11px] hidden xs:inline">
            {gustDisplay}
          </span>
        </div>

        {/* Mobile Toggles for Legend & Layers */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => {
              setShowLegendMobile(!showLegendMobile);
              if (!showLegendMobile) setShowLayersMobile(false);
            }}
            className={`flamap-glass px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1 border ${
              showLegendMobile ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'text-slate-300 border-white/10'
            }`}
          >
            <span>{layers.airQuality ? 'Air Quality' : t.burnedArea}</span>
            {showLegendMobile ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            onClick={() => {
              setShowLayersMobile(!showLayersMobile);
              if (!showLayersMobile) setShowLegendMobile(false);
            }}
            className={`flamap-glass px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1 border ${
              showLayersMobile ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' : 'text-slate-300 border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Layers</span>
          </button>
        </div>

        {/* Desktop Legend Box */}
        <div className="flamap-glass p-2.5 sm:p-3 rounded-2xl w-full sm:w-64 hidden md:flex md:flex-col">
          {/* Header & Explicit Toggle Pills */}
          <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-white/10">
            <button
              onClick={() => onToggleLayer('airQuality')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                layers.airQuality ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Air Quality</span>
            </button>
            <button
              onClick={() => {
                if (layers.airQuality) onToggleLayer('airQuality');
                if (!layers.hotspots) onToggleLayer('hotspots');
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                !layers.airQuality ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-sm border border-amber-500/50 bg-[#1c1917]" />
              <span>Burned Area</span>
            </button>
          </div>

          {layers.airQuality ? (
            <>
              <div className="flex items-center justify-between text-xs mb-1.5 sm:mb-2">
                <span className="text-[10px] font-semibold text-slate-200">US EPA / EC Scale</span>
                <span className="text-[9px] text-slate-400">AQI / AQHI</span>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 rounded-full w-full bg-gradient-to-r from-[#38bdf8] via-[#22c55e] via-[#eab308] via-[#f97316] to-[#e11d48]" />
                <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-300 font-medium px-0.5 whitespace-nowrap">
                  <span className="text-sky-400 font-semibold">Good (0-50)</span>
                  <span className="text-yellow-400 font-semibold">Moderate</span>
                  <span className="text-rose-400 font-semibold">Hazardous (200+)</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs mb-1.5 sm:mb-2">
                <span className="text-[10px] font-semibold text-slate-200">{t.burnedArea}</span>
                <span className="text-[9px] text-slate-400">effis / cwfis</span>
              </div>

              <div className="space-y-1">
                <div className="h-2 rounded-full w-full bg-gradient-to-r from-[#451a03] via-[#ef4444] to-[#ffcc00]" />
                <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 font-medium px-0.5">
                  <span>{t.daysAgo(5)}</span>
                  <span>24 h</span>
                  <span className="text-amber-400 font-semibold">{t.justNow}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Player Timeline Scrubber */}
      <div className="pointer-events-auto flex-1 max-w-xl w-full flex flex-col items-center">
        <div className="mb-1 text-shadow text-white text-xs sm:text-sm md:text-base font-semibold capitalize tracking-wide font-['Outfit'] flex items-center gap-1.5 bg-black/60 px-3 py-0.5 sm:px-4 sm:py-1 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
          <span>{formattedDateString}</span>
        </div>

        <div className="flamap-glass p-2 sm:p-3 rounded-2xl w-full flex items-center gap-2 sm:gap-3 relative">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition transform active:scale-95 flex-shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1 relative pt-2 sm:pt-3">
            <div className="absolute top-0 left-0 right-0 h-2.5 sm:h-3 flex items-end justify-between px-1 pointer-events-none opacity-60">
              {histogramBars.map((height, idx) => (
                <div
                  key={`bar-${idx}`}
                  className="w-0.5 sm:w-1 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
                  style={{ height: `${(height / 120) * 100}%` }}
                />
              ))}
            </div>

            <input
              type="range"
              min="0"
              max="120"
              step="1"
              value={120 - currentAgeHours}
              onChange={(e) => onChangeAgeHours(120 - parseFloat(e.target.value))}
              className="w-full h-2 sm:h-2.5 bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 sm:p-1 rounded-xl border border-white/10">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-bold transition ${
                  playbackSpeed === spd
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onToggleDataUpdates}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition border border-white/10 flex-shrink-0"
            title={t.dataUpdates}
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Right side: Layer & Map Style Toggles */}
      <div className={`pointer-events-auto flamap-glass p-2 sm:p-2.5 rounded-2xl flex-col gap-1.5 ${
        showLayersMobile ? 'flex w-full' : 'hidden md:flex'
      }`}>
        {/* Map Base Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 mb-0.5">
          <button
            onClick={() => onSelectMapStyle('satellite')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
              mapStyle === 'satellite' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => onSelectMapStyle('dark')}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
              mapStyle === 'dark' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:flex md:flex-col gap-1.5 w-full">
          <button
            onClick={() => onToggleLayer('hotspots')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
              layers.hotspots ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>{t.hotspots}</span>
            </div>
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleLayer('airQuality')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
              layers.airQuality ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.airQuality}</span>
            </div>
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleLayer('smoke')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
              layers.smoke ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CloudFog className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.smokeForecast}</span>
            </div>
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleLayer('perimeters')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
              layers.perimeters ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-900 border border-red-500" />
              <span>{t.perimeters}</span>
            </div>
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleLayer('wind')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 transition ${
              layers.wind ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.windVectors}</span>
            </div>
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


