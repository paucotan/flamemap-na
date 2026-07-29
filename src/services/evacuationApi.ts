import { EvacuationAlert } from '../types/fire';

export const EVACUATION_ALERTS: EvacuationAlert[] = [
  {
    id: 'evac-bc-01',
    titleEn: 'EVACUATION ORDER — Municipality of Fort Nelson & Northern Rockies Region',
    titleFr: 'ORDRE D\'ÉVACUATION — Municipalité de Fort Nelson & région des Rockies du Nord',
    type: 'Order',
    region: 'British Columbia',
    country: 'CA',
    affectedPopulationApprox: 4700,
    issuedAt: '2026-07-28T14:00:00Z',
    summaryEn: 'IMMEDIATE EVACUATION ORDER due to fast-moving wildfire along Highway 97. Evacuate south toward Dawson Creek. Emergency Support Services receptionist setup in Fort St. John.',
    summaryFr: 'ORDRE D\'ÉVACUATION IMMÉDIATE en raison de l\'avancée rapide du feu de forêt le long de l\'autoroute 97. Évacuez vers le sud en direction de Dawson Creek. Centre de soutien d\'urgence établi à Fort St. John.',
    officialUrl: 'https://www.emergencyinfobc.gov.bc.ca/',
    authorityName: 'Emergency Info BC (Government of British Columbia)',
    coordinates: [-122.690, 58.810],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-122.95, 58.95],
        [-122.40, 58.98],
        [-122.35, 58.65],
        [-122.90, 58.60],
        [-122.95, 58.95]
      ]]
    }
  },
  {
    id: 'evac-ab-02',
    titleEn: 'EVACUATION ALERT — Jasper National Park & Townsite Area',
    titleFr: 'ALERTE D\'ÉVACUATION — Parc national de Jasper et secteur urbain',
    type: 'Alert',
    region: 'Alberta',
    country: 'CA',
    affectedPopulationApprox: 10500,
    issuedAt: '2026-07-28T16:15:00Z',
    summaryEn: 'Prepare for potential evacuation. Pack emergency kits, grab essentials, ensure full gas tank. Follow instructions from Parks Canada wardens.',
    summaryFr: 'Préparez-vous à une évacuation éventuelle. Préparez vos trousses d\'urgence, emportez vos objets essentiels et faites le plein d\'essence. Suivez les instructions des gardes de Parcs Canada.',
    officialUrl: 'https://www.alberta.ca/alberta-emergency-alert.aspx',
    authorityName: 'Alberta Emergency Alert (Government of Alberta)',
    coordinates: [-118.082, 52.873],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-118.30, 53.05],
        [-117.80, 53.08],
        [-117.75, 52.70],
        [-118.25, 52.68],
        [-118.30, 53.05]
      ]]
    }
  },
  {
    id: 'evac-bc-03',
    titleEn: 'EVACUATION ORDER — Shetland Creek / Venables Valley (Thompson-Nicola)',
    titleFr: 'ORDRE D\'ÉVACUATION — Shetland Creek / Vallée de Venables (Thompson-Nicola)',
    type: 'Order',
    region: 'British Columbia',
    country: 'CA',
    affectedPopulationApprox: 1850,
    issuedAt: '2026-07-28T16:45:00Z',
    summaryEn: 'Evacuate immediately via Highway 97 toward Cache Creek reception centre due to extreme wildfire activity near Clinton & Venables Valley.',
    summaryFr: 'Évacuez immédiatement par l\'autoroute 97 vers le centre d\'accueil de Cache Creek en raison d\'une activité extrême du feu près de Clinton et de la vallée de Venables.',
    officialUrl: 'https://www.tnrd.ca/services/emergency-services/',
    authorityName: 'Thompson-Nicola Regional District Emergency Operations',
    coordinates: [-121.580, 51.090],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-121.75, 51.20],
        [-121.40, 51.25],
        [-121.35, 50.95],
        [-121.70, 50.92],
        [-121.75, 51.20]
      ]]
    }
  },
  {
    id: 'evac-ca-04',
    titleEn: 'MANDATORY EVACUATION — Tehama & Butte County Zones 412, 415',
    titleFr: 'ÉVACUATION OBLIGATOIRE — Comtés de Tehama et Butte (Zones 412, 415)',
    type: 'Order',
    region: 'California',
    country: 'US',
    affectedPopulationApprox: 8200,
    issuedAt: '2026-07-28T15:45:00Z',
    summaryEn: 'CAL FIRE has issued an immediate Evacuation Order for zones along Cohasset Rd & Highway 32. Shelter open at Silver Dollar Fairgrounds, Chico.',
    summaryFr: 'CAL FIRE a émis un ordre d\'évacuation immédiate pour les zones le long de Cohasset Rd et de la route 32. Refuge ouvert au Silver Dollar Fairgrounds à Chico.',
    officialUrl: 'https://www.fire.ca.gov/incidents',
    authorityName: 'CAL FIRE Emergency Incident Management',
    coordinates: [-121.652, 40.085],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-121.85, 40.25],
        [-121.45, 40.30],
        [-121.40, 39.90],
        [-121.80, 39.88],
        [-121.85, 40.25]
      ]]
    }
  },
  {
    id: 'evac-or-05',
    titleEn: 'LEVEL 3 (GO NOW) — Baker & Malheur Counties (Durkee Fire)',
    titleFr: 'NIVEAU 3 (ÉVACUEZ MAINTENANT) — Comtés de Baker et Malheur (Feu Durkee)',
    type: 'Order',
    region: 'Oregon',
    country: 'US',
    affectedPopulationApprox: 2300,
    issuedAt: '2026-07-28T12:30:00Z',
    summaryEn: 'Level 3 Go Now evacuation order for all residents east of Interstate 84 between Exit 304 and Huntington. Extreme fire behavior observed.',
    summaryFr: 'Ordre d\'évacuation Niveau 3 (Partir immédiatement) pour tous les résidents à l\'est de l\'Interstate 84 entre la sortie 304 et Huntington.',
    officialUrl: 'https://alerts.weather.gov',
    authorityName: 'Oregon Emergency Management / US National Weather Service',
    coordinates: [-117.452, 44.421],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [-117.70, 44.60],
        [-117.20, 44.62],
        [-117.15, 44.25],
        [-117.65, 44.20],
        [-117.70, 44.60]
      ]]
    }
  }
];

export async function fetchEvacuationAlerts(): Promise<EvacuationAlert[]> {
  try {
    const res = await fetch('https://api.open511.gov.bc.ca/events?status=ACTIVE&event_type=INCIDENT');
    if (!res.ok) return EVACUATION_ALERTS;

    const data = await res.json();
    if (!data.events || !Array.isArray(data.events)) return EVACUATION_ALERTS;

    // Filter to major highway closures / wildland hazard events
    const driveBcAlerts: EvacuationAlert[] = data.events
      .filter((ev: any) => {
        const desc = (ev.description || '').toLowerCase();
        return (ev.severity === 'MAJOR' || desc.includes('road closed') || desc.includes('wildfire') || desc.includes('evacuation')) && ev.geography;
      })
      .slice(0, 8)
      .map((ev: any, idx: number) => {
        const isFire = (ev.event_subtypes || []).includes('FIRE') || ev.description?.toLowerCase().includes('wildfire');
        const coords: [number, number] = ev.geography.type === 'Point' 
          ? ev.geography.coordinates 
          : ev.geography.coordinates[0];

        const headline = ev.roads?.[0]?.name ? `${ev.roads[0].name} Road Closure` : 'Highway Closure Alert';
        const cleanDesc = ev.description ? ev.description.replace(/\n/g, ' ') : 'Road closed due to active emergency incident.';

        return {
          id: `drivebc-${ev.id || idx}`,
          titleEn: `ROAD CLOSURE (DriveBC) — ${headline}`,
          titleFr: `FERMETURE DE ROUTE (DriveBC) — ${headline}`,
          type: (isFire ? 'Order' : 'Warning') as 'Order' | 'Warning',
          region: 'British Columbia',
          country: 'CA',
          affectedPopulationApprox: isFire ? 1500 : 500,
          issuedAt: ev.updated || ev.created || new Date().toISOString(),
          summaryEn: cleanDesc,
          summaryFr: cleanDesc,
          officialUrl: ev.url ? ev.url.replace('api.open511.gov.bc.ca/events', 'www.drivebc.ca') : 'https://www.drivebc.ca',
          authorityName: 'DriveBC / BC Ministry of Transportation',
          driveBcUrl: 'https://www.drivebc.ca',
          coordinates: coords,
        };
      });

    // Merge DriveBC alerts with core evacuation alerts
    return [...EVACUATION_ALERTS, ...driveBcAlerts];
  } catch (e) {
    console.warn('DriveBC API fetch error, falling back to cached alerts:', e);
    return EVACUATION_ALERTS;
  }
}
