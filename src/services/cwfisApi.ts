import { FireIncident } from '../types/fire';

export async function fetchCanadianIncidents(): Promise<FireIncident[]> {
  const allIncidents: FireIncident[] = [];

  // 1. Fetch live BC Wildfire Service active incidents from official BC Government ArcGIS REST service
  try {
    const bcwsUrl = "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=FIRE_STATUS+NOT+LIKE+'%25Out%25'&outFields=*&f=geojson";
    const res = await fetch(bcwsUrl);
    if (res.ok) {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      
      if (data && data.features && data.features.length > 0) {
        const liveBcIncidents: FireIncident[] = data.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [-121.5, 51.0];
          const rawName = props.INCIDENT_NAME || props.GEOGRAPHIC_DESCRIPTION;
          const name = rawName
            ? (props.FIRE_NUMBER && !rawName.includes(props.FIRE_NUMBER) ? `${rawName} (${props.FIRE_NUMBER})` : rawName)
            : `BC Wildfire #${idx + 1}`;
          
          const hectares = Math.round(props.CURRENT_SIZE || 0);
          const acres = Math.round(hectares * 2.47105);
          
          let status: 'Out of Control' | 'Being Monitored' | 'Under Control' = 'Out of Control';
          if (props.FIRE_STATUS === 'Under Control') {
            status = 'Under Control';
          } else if (props.FIRE_STATUS === 'Being Held' || props.FIRE_STATUS === 'Under Patrol') {
            status = 'Being Monitored';
          } else if (props.FIRE_STATUS === 'Out of Control' || props.FIRE_STATUS === 'Fire of Note') {
            status = 'Out of Control';
          }

          const bulletinUrl = props.FIRE_URL || (props.FIRE_NUMBER ? `https://wildfiresituation.nrs.gov.bc.ca/incidents?fireYear=${props.FIRE_YEAR || 2026}&incidentNumber=${props.FIRE_NUMBER}` : 'https://wildfiresituation.nrs.gov.bc.ca/incidents');

          return {
            id: `bcws-live-${props.FIRE_NUMBER || props.OBJECTID || idx}`,
            name,
            country: 'CA',
            provinceOrState: 'British Columbia',
            latitude: coords[1],
            longitude: coords[0],
            hectaresBurned: hectares,
            acresBurned: acres,
            containmentPercentage: status === 'Under Control' ? 100 : (status === 'Being Monitored' ? 65 : (props.FIRE_OF_NOTE_IND === 'Y' ? 10 : 20)),
            status,
            agency: props.FIRE_OF_NOTE_IND === 'Y' ? 'BC Wildfire Service (Wildfire of Note)' : 'BC Wildfire Service',
            cause: props.FIRE_CAUSE || 'Under Investigation',
            updatedAt: props.UPDATE_DATE ? new Date(props.UPDATE_DATE).toISOString() : (props.IGNITION_DATE ? new Date(props.IGNITION_DATE).toISOString() : new Date().toISOString()),
            officialBulletinUrl: bulletinUrl
          };
        });
        allIncidents.push(...liveBcIncidents);
      }
    }
  } catch (e) {
    console.warn('BC Wildfire Service API error:', e);
  }

  // 2. Fetch live CWFIS (Natural Resources Canada) Active Fires GeoJSON feed with safe parse
  try {
    const cwfisUrl = 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=public:activefires_current&outputFormat=json';
    const res = await fetch(cwfisUrl);
    if (res.ok) {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && data.features && data.features.length > 0) {
        const cwfisIncidents: FireIncident[] = data.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const name = props.firename || props.agency_id || `Canadian Fire #${idx + 1}`;
          const hectares = Math.round(props.hectares || 0);
          const acres = Math.round(hectares * 2.47105);
          
          const stage = (props.stage_of_control || '').toLowerCase();
          let status: 'Out of Control' | 'Being Monitored' | 'Under Control' = 'Out of Control';
          if (stage.includes('out') || stage.includes('under control')) {
            status = 'Under Control';
          } else if (stage.includes('held') || stage.includes('monitored')) {
            status = 'Being Monitored';
          }

          const provMap: Record<string, string> = {
            'BC': 'British Columbia', 'AB': 'Alberta', 'SK': 'Saskatchewan',
            'MB': 'Manitoba', 'ON': 'Ontario', 'QC': 'Quebec',
            'NB': 'New Brunswick', 'NS': 'Nova Scotia', 'NL': 'Newfoundland & Labrador',
            'YT': 'Yukon', 'NT': 'Northwest Territories'
          };
          const provName = provMap[props.agency] || props.agency || 'Canada';

          return {
            id: `cwfis-live-${props.fireid || idx}`,
            name,
            country: 'CA',
            provinceOrState: provName,
            latitude: coords[1],
            longitude: coords[0],
            hectaresBurned: hectares,
            acresBurned: acres,
            containmentPercentage: status === 'Under Control' ? 100 : (status === 'Being Monitored' ? 65 : 20),
            status,
            agency: `CWFIS / ${props.agency || 'NRCan'}`,
            cause: props.cause || 'Lightning / Under Investigation',
            updatedAt: props.rep_date ? new Date(props.rep_date).toISOString() : new Date().toISOString(),
            officialBulletinUrl: 'https://cwfis.cfs.nrcan.gc.ca/'
          };
        });

        const existingIds = new Set(allIncidents.map(i => i.name.toLowerCase()));
        for (const inc of cwfisIncidents) {
          if (!existingIds.has(inc.name.toLowerCase()) && inc.latitude !== 0) {
            allIncidents.push(inc);
          }
        }
      }
    }
  } catch (e) {
    console.warn('CWFIS GeoServer API error:', e);
  }

  return allIncidents;
}
