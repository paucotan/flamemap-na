import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { MapContainer } from './components/MapContainer';
import { TimelineControl } from './components/TimelineControl';
import { EvacuationBanner } from './components/EvacuationBanner';
import { CreditsModal } from './components/CreditsModal';
import { SettingsModal } from './components/SettingsModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { WindParticleCanvas } from './components/WindParticleCanvas';
import { DataUpdatesDrawer } from './components/DataUpdatesDrawer';

import { Hotspot, FireIncident, EvacuationAlert, WindPoint, UnitSystem, ViewportWind } from './types/fire';
import { fetchHotspots, DataUpdateLog } from './services/firmsApi';
import { fetchCanadianIncidents } from './services/cwfisApi';
import { fetchUSIncidents } from './services/nifcApi';
import { fetchEvacuationAlerts } from './services/evacuationApi';
import { fetchWindGrid } from './services/weatherApi';
import { Language } from './utils/i18n';
import { TimezoneMode } from './utils/timezone';

import { fetchLiveAqiStations, AqiStation } from './services/aqiApi';

import { MapStyleMode } from './components/TimelineControl';

export function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    return (localStorage.getItem('flamemap_unitSystem') as UnitSystem) || 'metric';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('flamemap_lang') as Language) || 'en';
  });
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>(() => {
    return (localStorage.getItem('flamemap_timezoneMode') as TimezoneMode) || 'auto';
  });
  const [mapStyle, setMapStyle] = useState<MapStyleMode>(() => {
    return (localStorage.getItem('flamemap_mapStyle') as MapStyleMode) || 'satellite';
  });

  const handleSelectUnitSystem = (sys: UnitSystem) => {
    setUnitSystem(sys);
    localStorage.setItem('flamemap_unitSystem', sys);
  };

  const handleSelectLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('flamemap_lang', l);
  };

  const handleSelectTimezoneMode = (tz: TimezoneMode) => {
    setTimezoneMode(tz);
    localStorage.setItem('flamemap_timezoneMode', tz);
  };

  const handleSelectMapStyle = (style: MapStyleMode) => {
    setMapStyle(style);
    localStorage.setItem('flamemap_mapStyle', style);
  };

  const [maxAgeHours, setMaxAgeHours] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [updateLogs, setUpdateLogs] = useState<DataUpdateLog[]>([]);
  const [incidents, setIncidents] = useState<FireIncident[]>([]);
  const [alerts, setAlerts] = useState<EvacuationAlert[]>([]);
  const [windPoints, setWindPoints] = useState<WindPoint[]>([]);
  const [aqiStations, setAqiStations] = useState<AqiStation[]>([]);
  const [viewportWind, setViewportWind] = useState<ViewportWind | undefined>(undefined);

  const [selectedIncident, setSelectedIncident] = useState<FireIncident | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showEvacuationDrawer, setShowEvacuationDrawer] = useState<boolean>(false);
  const [showDataUpdatesDrawer, setShowDataUpdatesDrawer] = useState<boolean>(false);

  const [layers, setLayers] = useState({
    hotspots: true,
    perimeters: true,
    wind: true,
    evacuations: true,
    smoke: true,
    airQuality: true,
  });

  const [statusFilter, setStatusFilter] = useState({
    outOfControl: true,
    beingMonitored: true,
    underControl: true,
  });

  const handleToggleStatusFilter = (statusKey: 'outOfControl' | 'beingMonitored' | 'underControl') => {
    setStatusFilter(prev => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
  };

  useEffect(() => {
    async function loadAllData() {
      const { hotspots: loadedHotspots, logs } = await fetchHotspots();
      setHotspots(loadedHotspots);
      setUpdateLogs(logs);

      const ca = await fetchCanadianIncidents();
      const us = await fetchUSIncidents();
      const allIncidents = [...ca, ...us];
      setIncidents(allIncidents);

      const loadedAlerts = await fetchEvacuationAlerts();
      setAlerts(loadedAlerts);

      const wind = await fetchWindGrid(40.0, 62.0, -135.0, -75.0);
      setWindPoints(wind);

      const aqiData = await fetchLiveAqiStations();
      setAqiStations(aqiData);
    }

    loadAllData();
  }, []);

  const handleToggleUnitSystem = () => {
    handleSelectUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric');
  };

  const handleToggleLanguage = () => {
    handleSelectLanguage(lang === 'en' ? 'fr' : 'en');
  };

  const handleSelectIncidentOrLocation = (item: { lat: number; lng: number; zoom?: number; name: string }) => {
    const foundInc = incidents.find(i => i.name.toLowerCase().includes(item.name.toLowerCase()));
    if (foundInc) {
      setSelectedIncident(foundInc);
    }
  };

  const handleToggleLayer = (layerName: 'hotspots' | 'perimeters' | 'wind' | 'evacuations' | 'smoke' | 'airQuality') => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f1115] text-slate-100 select-none">
      {/* Navbar Header */}
      <Navbar
        unitSystem={unitSystem}
        onToggleUnitSystem={handleToggleUnitSystem}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
        timezoneMode={timezoneMode}
        onOpenSettings={() => setShowSettingsModal(true)}
        incidents={incidents}
        alerts={alerts}
        onSelectIncidentOrLocation={handleSelectIncidentOrLocation}
        onOpenCredits={() => setShowCreditsModal(true)}
        onToggleEvacuations={() => setShowEvacuationDrawer((prev) => !prev)}
        showEvacuationDrawer={showEvacuationDrawer}
        layers={layers}
        onToggleLayer={handleToggleLayer}
      />

      {/* Main Map Engine Viewport */}
      <MapContainer
        hotspots={hotspots}
        incidents={incidents.filter(inc => {
          if (inc.status === 'Out of Control' && !statusFilter.outOfControl) return false;
          if (inc.status === 'Being Monitored' && !statusFilter.beingMonitored) return false;
          if (inc.status === 'Under Control' && !statusFilter.underControl) return false;
          return true;
        })}
        alerts={alerts}
        windPoints={windPoints}
        aqiStations={aqiStations}
        lang={lang}
        maxAgeHours={maxAgeHours}
        unitSystem={unitSystem}
        mapStyle={mapStyle}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
        onViewportWindChange={(w) => setViewportWind(w)}
        layers={layers}
      />

      {/* Smooth Canvas Wind Streamlines Particle Overlay */}
      <WindParticleCanvas windPoints={windPoints} enabled={layers.wind} />

      {/* Bottom Player & Scrubber Timeline */}
      <TimelineControl
        currentAgeHours={maxAgeHours}
        onChangeAgeHours={(age) => setMaxAgeHours(age)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={(spd) => setPlaybackSpeed(spd)}
        unitSystem={unitSystem}
        lang={lang}
        timezoneMode={timezoneMode}
        viewportWind={viewportWind}
        mapStyle={mapStyle}
        onSelectMapStyle={handleSelectMapStyle}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        statusFilter={statusFilter}
        onToggleStatusFilter={handleToggleStatusFilter}
        onToggleDataUpdates={() => setShowDataUpdatesDrawer((prev) => !prev)}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          unitSystem={unitSystem}
          onSelectUnitSystem={handleSelectUnitSystem}
          lang={lang}
          onSelectLanguage={handleSelectLanguage}
          timezoneMode={timezoneMode}
          onSelectTimezoneMode={handleSelectTimezoneMode}
          onClose={() => setShowSettingsModal(false)}
          onOpenCredits={() => setShowCreditsModal(true)}
        />
      )}

      {/* Data Updates Drawer */}
      {showDataUpdatesDrawer && (
        <DataUpdatesDrawer
          logs={updateLogs}
          lang={lang}
          onClose={() => setShowDataUpdatesDrawer(false)}
        />
      )}

      {/* Evacuation Alert Drawer */}
      {showEvacuationDrawer && (
        <EvacuationBanner
          alerts={alerts}
          lang={lang}
          onClose={() => setShowEvacuationDrawer(false)}
          onSelectAlert={(alert) => {
            handleSelectIncidentOrLocation({
              lat: alert.coordinates[1],
              lng: alert.coordinates[0],
              zoom: 9,
              name: alert.titleEn
            });
          }}
        />
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          unitSystem={unitSystem}
          lang={lang}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {/* Sources & Credits Modal */}
      {showCreditsModal && (
        <CreditsModal lang={lang} onClose={() => setShowCreditsModal(false)} />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
