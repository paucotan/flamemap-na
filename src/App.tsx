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

export function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [lang, setLang] = useState<Language>('en');
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('auto');

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
    setUnitSystem((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'fr' : 'en'));
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
        incidents={incidents}
        alerts={alerts}
        windPoints={windPoints}
        aqiStations={aqiStations}
        lang={lang}
        maxAgeHours={maxAgeHours}
        unitSystem={unitSystem}
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
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onToggleDataUpdates={() => setShowDataUpdatesDrawer((prev) => !prev)}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          unitSystem={unitSystem}
          onSelectUnitSystem={(sys) => setUnitSystem(sys)}
          lang={lang}
          onSelectLanguage={(l) => setLang(l)}
          timezoneMode={timezoneMode}
          onSelectTimezoneMode={(tz) => setTimezoneMode(tz)}
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
        <CreditsModal onClose={() => setShowCreditsModal(false)} />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
