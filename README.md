# FlameMap North America 🇨🇦 🇺🇸

> Real-time wildland fire map, thermal satellite timelines, smoke forecasts, Air Quality Index (AQI), wind streamline vectors, and emergency evacuation alerts across Canada & the United States.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-4.x-blue.svg)](https://maplibre.org/)
[![Daily Audit](https://github.com/paucotan/flamemap-na/actions/workflows/daily_audit.yml/badge.svg)](https://github.com/paucotan/flamemap-na/actions/workflows/daily_audit.yml)

---

## 🌟 Overview

![FlameMap North America Interface](public/docs/app_preview.png)

**FlameMap North America** is an open-source, citizen-centric platform providing real-time situational awareness of active wildfires across North America. Inspired by **[Flamap.fr](https://flamap.fr)** created by **[@GuillaumeRozier](https://x.com/GuillaumeRozier)** in France, FlameMap aggregates open satellite and emergency data from NASA, NIFC (US), CWFIS (Canada), Open-Meteo, and Environment Canada into a smooth, interactive 60 FPS experience.

---

## ✨ Features

- 🛰️ **Near-Real-Time Satellite Thermal Hotspots**: Live MODIS & VIIRS 375m thermal anomaly detections with age decay color gradients (0 to 120 hours). Bright outer yellow dots highlight advancing active fire fronts.
- 🔥 **Nationwide Active Wildfires**: Integrates 600+ live US incidents (NIFC WFIGS) and Canadian provincial wildfires (BC Wildfire Service, Parks Canada, SOPFEU Quebec, AFFES Ontario, NL Forestry).
- 🫁 **Air Quality Index (AQI / AQHI)**: Continuous GPU-accelerated spatial Air Quality Index heatmap overlay and live city station badges across BC, Alberta, the US West, and Eastern Canada.
- 🚨 **Emergency Evacuation Orders & Alerts**: Real-time ticker marquee and collapsible drawer for evacuation warnings with direct links to official government emergency portals (`Emergency Info BC`, `Alberta Emergency Alert`, `CAL FIRE`).
- 💨 **Apple-Style Wind Streamlines**: Dense particle streamline animation (1,200 fine lines) calibrated to live NOAA GFS & Open-Meteo wind vectors with cardinal compass directions (e.g. `WSW 21 km/h`).
- 🗺️ **Map Style Switcher**: Instant toggle between high-res Esri **Satellite** imagery and high-contrast **Dark Map** vector mode.
- 🕒 **Time-Lapse Scrubber**: Interactive player with speed controls (1x, 2x, 5x) to animate hotspot accumulation over time.
- 🌐 **Bilingual (EN / FR) & Unit Switcher**: Toggle between Metric (`ha, km/h`) and Imperial (`acres, mph`), with bilingual UI.
- ⚙️ **Browser Timezone Auto-Detection**: Formats all satellite update logs and incident reports in user's local timezone (e.g. `PDT`, `EDT`, `UTC`).
- 🔗 **Deep-Linking (#map=z/lat/lng)**: Preserves map position in URL hash for 1-click sharing.
- 🛡️ **Automated Data Sanity & System Audit**: Daily automated cloud verification loop ensuring government API feed integrity, coordinate accuracy, live news ground-truth cross-referencing, and pre-flight Vercel build safety.

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

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔍 Automated Data Sanity & System Auditing

FlameMap includes an automated, multi-tiered continuous auditing pipeline to guarantee feed integrity and deployment safety:

- **Data Sanity Verification**: Validates geo-coordinate bounding boxes (e.g. Canada lat $41.6^\circ\text{N}$ to $83.1^\circ\text{N}$), feed freshness, and cross-references live incidents against current government news bulletins (*BC Wildfires of Note*, *Alberta Emergency Alert*).
- **Vercel Pre-Flight Build Gate**: Audits TypeScript compilation (`tsc -b`), ESLint compliance, and Vite production bundle generation before any push.
- **Daily Cloud Automation**: Runs on GitHub Actions daily at `06:00 UTC`. View the active audit log anytime in [`AUDIT_LOG.md`](file:///Users/ocean/Downloads/flamemap-na/AUDIT_LOG.md).
- **Emergency Safety Protocol**: Includes instant reset instructions in [`VERCEL_DEPLOYMENT_SAFETY.md`](file:///Users/ocean/Downloads/flamemap-na/VERCEL_DEPLOYMENT_SAFETY.md).

---

## 🛠️ Data Sources & Attribution

- **NASA FIRMS** — Near-Real-Time MODIS & VIIRS 375m Satellite Thermal Anomalies ([firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/))
- **CWFIS / NRCan** — Natural Resources Canada Active Fire Database & Perimeters ([cwfis.cfs.nrcan.gc.ca](https://cwfis.cfs.nrcan.gc.ca/))
- **NIFC WFIGS** — National Interagency Fire Center US Wildfires ([www.nifc.gov](https://www.nifc.gov/))
- **BC Wildfire Service & Emergency Info BC** — Official British Columbia Wildfire & Evacuation Data ([wildfiresituation.nrs.gov.bc.ca](https://wildfiresituation.nrs.gov.bc.ca/))
- **Open-Meteo** — Live GFS Wind Model Vectors & Air Quality Index API ([open-meteo.com](https://open-meteo.com/))
- **Esri & CartoDB** — High-Res Satellite Imagery & Dark Vector Basemaps

---

## 🧡 Inspiration & Support

- **Original Concept**: Directly inspired by **[Flamap.fr](https://flamap.fr)** created by **[@GuillaumeRozier](https://x.com/GuillaumeRozier)** in France.
- **Developer**: Created and maintained by **Paul Cohen-Tannugi** ([GitHub @paucotan](https://github.com/paucotan)).
- **Wildfire Relief**: We encourage supporting official local wildfire relief funds like the **[United Way BC Wildfire Recovery Fund](https://uwbc.ca)**.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
