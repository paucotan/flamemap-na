# FlameMap North America 🇨🇦 🇺🇸

> Real-time wildland fire map, thermal satellite timelines, smoke forecasts, wind streamline vectors, and emergency evacuation alerts across Canada & the United States.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-4.x-blue.svg)](https://maplibre.org/)

---

## 🌟 Overview

**FlameMap North America** is an open-source, citizen-centric platform providing real-time awareness of active wildfires across North America. Inspired by **[Flamap.fr](https://flamap.fr)** created by **[@GuillaumeRozier](https://x.com/GuillaumeRozier)** in France, FlameMap aggregates open data from NASA, NIFC (US), and CWFIS (Canada) into a smooth 60 FPS interactive experience.

---

## ✨ Features

- 🛰️ **Near-Real-Time Satellite Thermal Hotspots**: Live MODIS & VIIRS thermal anomaly detections with age decay color gradients (0 to 120 hours).
- 🔥 **Nationwide Active Wildfires**: Integrates 600+ live US incidents (NIFC WFIGS) and Canadian provincial wildfires (BC Wildfire Service, Parks Canada, SOPFEU Quebec, AFFES Ontario, NL Forestry).
- 🚨 **Emergency Evacuation Orders & Alerts**: Real-time evacuation warnings with direct links to official government emergency portals (`Emergency Info BC`, `Alberta Emergency Alert`, `CAL FIRE`).
- 💨 **Spatial Wind Streamlines Canvas**: HTML5 Canvas particle streamline animation calibrated to local weather vectors.
- 🕒 **Time-Lapse Scrubber**: Interactive player with speed controls (1x, 2x, 5x) to animate hotspot accumulation over time.
- 🌐 **Bilingual (EN / FR) & Unit Switcher**: Toggle between Metric (`ha, km/h`) and Imperial (`acres, mph`), with bilingual UI.
- ⚙️ **Browser Timezone Auto-Detection**: Formats all satellite update logs and incident reports in user's local timezone (e.g. `PDT`, `EDT`, `UTC`).
- 🔗 **Deep-Linking (#map=z/lat/lng)**: Preserves map position in URL hash for 1-click sharing.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation & Local Run
```bash
# Clone repository
git clone https://github.com/paucotan/flamemap-na.git
cd flamemap-na

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Data Sources & Attribution

- **NASA FIRMS** — Near-Real-Time MODIS & VIIRS 375m Satellite Thermal Anomalies ([firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/))
- **CWFIS / NRCan** — Natural Resources Canada Active Fire Database ([cwfis.cfs.nrcan.gc.ca](https://cwfis.cfs.nrcan.gc.ca/))
- **NIFC WFIGS** — National Interagency Fire Center US Wildfires ([www.nifc.gov](https://www.nifc.gov/))
- **BC Wildfire Service & Emergency Info BC** — Official British Columbia Wildfire & Evacuation Data ([wildfiresituation.nrs.gov.bc.ca](https://wildfiresituation.nrs.gov.bc.ca/))
- **Open-Meteo & Esri** — Wind Model Vectors & Satellite Basemap ([open-meteo.com](https://open-meteo.com/))

---

## 🧡 Inspiration & Credits

- **Original Concept**: Inspired by **[Flamap.fr](https://flamap.fr)** created by **[@GuillaumeRozier](https://x.com/GuillaumeRozier)**.
- **Developer**: Created and maintained by **Paul Cohen-Tannugi** ([GitHub @paucotan](https://github.com/paucotan)).
- **Buy Me a Coffee**: [buymeacoffee.com/paucotan](https://buymeacoffee.com/paucotan) *(100% of voluntary support is pledged to official wildfire relief efforts like the United Way BC Wildfires Campaign)*.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
