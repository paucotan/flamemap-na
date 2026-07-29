import React from 'react';
import { X, Heart, ExternalLink, ShieldCheck, Code, Globe, HandHeart } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface CreditsModalProps {
  lang: Language;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ lang, onClose }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="flamap-glass rounded-3xl p-5 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200 my-auto">
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
            <h3 className="text-xl font-bold text-white font-['Outfit']">
              {lang === 'fr' ? 'Sources, crédits & dons' : 'Sources, Credits & Relief'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'fr' ? 'Données ouvertes, développeur et aide d\'urgence' : 'Open data, developer credit, and wildfire relief'}
            </p>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'fr' ? 'Créé par' : 'Created By'}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {lang === 'fr' ? (
              <>Développé et maintenu par <strong className="text-white font-semibold">Paul Cohen-Tannugi</strong>.</>
            ) : (
              <>Developed and maintained by <strong className="text-white font-semibold">Paul Cohen-Tannugi</strong>.</>
            )}
          </p>
          <a
            href="https://github.com/paucotan/flamemap-na"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-amber-300 font-semibold transition border border-white/10"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Dépôt GitHub (flamemap-na) ↗</span>
            <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
          </a>
        </div>

        {/* Official Wildfire Relief */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-1 text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <HandHeart className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'fr' ? 'Soutenez les secours d\'incendie officiels' : 'Support Official Wildfire Relief'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {lang === 'fr' ? (
              <>Pour aider les communautés touchées par les incendies, faites un don directement au fonds <strong className="text-emerald-300">United Way BC Wildfire Campaign</strong>.</>
            ) : (
              <>If you wish to help communities affected by wildfires, consider donating directly to the official <strong className="text-emerald-300">United Way BC Wildfire Campaign</strong>.</>
            )}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://uwbc.ca/campaign/wildfires/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-xs text-emerald-300 font-semibold transition border border-emerald-500/30 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'fr' ? 'Donner directement au fonds United Way BC ↗' : 'Donate Directly to United Way BC Wildfire Fund ↗'}</span>
            </a>
          </div>
        </div>

        {/* Flamap.fr & Guillaume Rozier Attribution */}
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">{t.inspiredBy}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {t.inspiredText}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://flamap.fr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-orange-300 font-semibold transition border border-white/10"
            >
              <span>{t.visitFlamap}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="https://x.com/GuillaumeRozier"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-sky-300 font-semibold transition border border-white/10"
            >
              <span>{t.followOnX}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Hyperlinked Open Data Sources List */}
        <div className="text-[11px] text-slate-400 space-y-1.5 border-t border-white/10 pt-4">
          <div className="font-semibold text-slate-300 mb-1">
            {lang === 'fr' ? 'Sources des données ouvertes :' : 'Open Data Sources:'}
          </div>
          <div>
            • <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">NASA FIRMS ↗</a> — {lang === 'fr' ? 'Anomalies thermiques satellites MODIS & VIIRS 375m' : 'MODIS & VIIRS 375m Satellite Thermal Anomalies'}
          </div>
          <div>
            • <a href="https://cwfis.cfs.nrcan.gc.ca/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">CWFIS / RNCan ↗</a> — {lang === 'fr' ? 'Données des feux actifs de Ressources naturelles Canada' : 'Natural Resources Canada Active Fire Data'}
          </div>
          <div>
            • <a href="https://www.nifc.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">NIFC WFIGS ↗</a> — {lang === 'fr' ? 'Centre National Interagences (Incendies USA)' : 'National Interagency Fire Center (US Wildfires)'}
          </div>
          <div>
            • <a href="https://www.emergencyinfobc.gov.bc.ca/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Emergency Info BC ↗</a> & <a href="https://www.fire.ca.gov/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">CAL FIRE ↗</a> — {lang === 'fr' ? 'Ordres et alertes d\'évacuation officiels' : 'Official Evacuation Orders & Alerts'}
          </div>
          <div>
            • <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Open-Meteo ↗</a> & <a href="https://www.esri.com/" target="_blank" rel="noreferrer" className="text-orange-400 font-semibold hover:underline">Esri ↗</a> — {lang === 'fr' ? 'Modèles de vent et imagerie satellite' : 'Wind Vector Models & Satellite Imagery'}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-semibold text-xs text-white transition shadow-lg shadow-orange-500/25"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
