import React from 'react';
import { Play, Pause, Compass, Info, Flame, Eye, Wind, CloudFog } from 'lucide-react';
import { UnitSystem, ViewportWind } from '../types/fire';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { TimezoneMode, formatTimestampWithTimezone } from '../utils/timezone';

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
  layers: { hotspots: boolean; perimeters: boolean; wind: boolean; evacuations: boolean; smoke: boolean };
  onToggleLayer: (layerName: 'hotspots' | 'perimeters' | 'wind' | 'evacuations' | 'smoke') => void;
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
  layers,
  onToggleLayer,
  onToggleDataUpdates,
}) => {
  const t = TRANSLATIONS[lang];

  const baseDate = new Date('2026-07-28T17:46:00Z');
  const activeDate = new Date(baseDate.getTime() - currentAgeHours * 3600 * 1000);

  const formattedDateString = formatTimestampWithTimezone(
    activeDate,
    timezoneMode,
    lang === 'fr' ? 'fr-FR' : 'en-US'
  );

  const speedDisplay = unitSystem === 'metric'
    ? `${viewportWind?.speedKmh || 22} km/h`
    : `${viewportWind?.speedMph || 14} mph`;

  const gustDisplay = unitSystem === 'metric'
    ? `(raf. ${viewportWind?.gustKmh || 32} km/h)`
    : `(gust ${viewportWind?.gustMph || 20} mph)`;

  const compassRotation = viewportWind?.directionDegrees || 225;

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
    <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none flex flex-col md:flex-row items-end justify-between gap-4">
      {/* Left side: Legend & Dynamic Viewport Wind meter badge */}
      <div className="pointer-events-auto flex flex-col gap-2">
        {/* Dynamic Viewport Wind Status Badge */}
        <div className="flamap-glass px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 text-slate-200 shadow-xl">
          <Compass
            className="w-4 h-4 text-cyan-400 transition-transform duration-500"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          />
          <span className="font-semibold text-white">
            {speedDisplay}
          </span>
          <span className="text-slate-400 text-[11px]">
            {gustDisplay}
          </span>
        </div>

        {/* Legend Box matching Flamap.fr */}
        <div className="flamap-glass p-3 rounded-2xl w-60">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-3 h-3 rounded-sm border border-amber-500/50 bg-[#1c1917]" />
              <span>{t.burnedArea}</span>
            </div>
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
        </div>
      </div>

      {/* Center: Player */}
      <div className="pointer-events-auto flex-1 max-w-xl w-full flex flex-col items-center">
        <div className="mb-1.5 text-shadow text-white text-base md:text-lg font-semibold capitalize tracking-wide font-['Outfit'] flex items-center gap-2 bg-black/50 px-4 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
          <span>{formattedDateString}</span>
        </div>

        <div className="flamap-glass p-3 rounded-2xl w-full flex items-center gap-3 relative">
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition transform active:scale-95 flex-shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1 relative pt-3">
            <div className="absolute top-0 left-0 right-0 h-3 flex items-end justify-between px-1 pointer-events-none opacity-60">
              {histogramBars.map((height, idx) => (
                <div
                  key={`bar-${idx}`}
                  className="w-1 rounded-t bg-gradient-to-t from-orange-600 to-amber-400"
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
              className="w-full h-2.5 bg-slate-800/90 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
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
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition border border-white/10 flex-shrink-0"
            title={t.dataUpdates}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right side: Layer Toggles */}
      <div className="pointer-events-auto flamap-glass p-2.5 rounded-2xl flex flex-col gap-1.5">
        <button
          onClick={() => onToggleLayer('hotspots')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 transition ${
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
          onClick={() => onToggleLayer('smoke')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 transition ${
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
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 transition ${
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
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 transition ${
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
  );
};
