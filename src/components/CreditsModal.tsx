import React from 'react';
import { X, Heart, ExternalLink, ShieldCheck, Code, Globe, Coffee, HandHeart } from 'lucide-react';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="flamap-glass rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">Sources, Credits & Relief</h3>
            <p className="text-xs text-slate-400">Open data, developer credit, and wildfire relief</p>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Created By</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Developed and maintained by <strong className="text-white font-semibold">Paul Cohen-Tannugi</strong>.
          </p>
          <a
            href="https://github.com/paucotan/flamemap-na"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-amber-300 font-semibold transition border border-white/10"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GitHub Repository (flamemap-na) ↗</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        </div>

        {/* 100% Wildfire Relief Pledge */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-1 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <HandHeart className="w-4 h-4 text-emerald-400" />
            <span>100% Wildfire Relief Pledge</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            100% of all voluntary coffee contributions and donations are passed directly to official wildfire emergency relief efforts including the <strong className="text-emerald-300">Canadian Red Cross British Columbia & Alberta Wildfire Appeals</strong>.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://buymeacoffee.com/paucotan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold transition border border-amber-500/30"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Support Relief (Buy Me a Coffee)</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="https://www.redcross.ca/how-we-help/current-emergency-responses/wildfires"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs text-emerald-300 font-semibold transition border border-emerald-500/30"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Canadian Red Cross Wildfire Fund ↗</span>
            </a>
          </div>
        </div>

        {/* Flamap.fr & Guillaume Rozier Attribution */}
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">Inspiration & Original Concept</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            This platform is directly inspired by <strong className="text-white">Flamap.fr</strong>, created by <strong className="text-white">@GuillaumeRozier</strong> in France. Full attribution and gratitude to Guillaume Rozier for inventing the Flamap interface concept!
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://flamap.fr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-orange-300 font-semibold transition border border-white/10"
            >
              <span>Visit Flamap.fr</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="https://x.com/GuillaumeRozier"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-sky-300 font-semibold transition border border-white/10"
            >
              <span>Follow @GuillaumeRozier on X</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Hyperlinked Open Data Sources List */}
        <div className="text-[11px] text-slate-400 space-y-1.5 border-t border-white/10 pt-4">
          <div className="font-semibold text-slate-300 mb-1">Open Data Sources:</div>
          <div>
            • <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">NASA FIRMS ↗</a> — MODIS & VIIRS 375m Satellite Thermal Anomalies
          </div>
          <div>
            • <a href="https://cwfis.cfs.nrcan.gc.ca/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">CWFIS / NRCan ↗</a> — Natural Resources Canada Active Fire Data
          </div>
          <div>
            • <a href="https://www.nifc.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">NIFC WFIGS ↗</a> — National Interagency Fire Center (US Wildfires)
          </div>
          <div>
            • <a href="https://www.emergencyinfobc.gov.bc.ca/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Emergency Info BC ↗</a> & <a href="https://www.fire.ca.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">CAL FIRE ↗</a> — Official Evacuation Orders & Alerts
          </div>
          <div>
            • <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Open-Meteo ↗</a> & <a href="https://www.esri.com/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Esri ↗</a> — Wind Vector Models & Satellite Imagery
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-semibold text-xs text-white transition shadow-lg shadow-orange-500/25"
        >
          Close Credits
        </button>
      </div>
    </div>
  );
};
