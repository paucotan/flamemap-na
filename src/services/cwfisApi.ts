import { FireIncident } from '../types/fire';

export async function fetchCanadianIncidents(): Promise<FireIncident[]> {
  const allIncidents: FireIncident[] = [];

  // 1. Fetch live BC Wildfire Service active incidents from official BC Government ArcGIS REST service
  try {
    const bcwsUrl = 'https://services6.arcgis.com/ubm4tcTYICKioTaa/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=1%3D1&outFields=GEOGRAPHIC_DESCRIPTION,FIRE_STATUS,CURRENT_SIZE,FIRE_CAUSE,FIRE_CENTRE,RESPONSE_TYPE_DESC,FIRE_NUMBER,UPDATE_DATE&f=geojson';
    const res = await fetch(bcwsUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const liveBcIncidents: FireIncident[] = data.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates || [-121.5, 51.0];
          const name = props.GEOGRAPHIC_DESCRIPTION
            ? (props.FIRE_NUMBER ? `${props.GEOGRAPHIC_DESCRIPTION} (#${props.FIRE_NUMBER})` : props.GEOGRAPHIC_DESCRIPTION)
            : `BC Wildfire #${idx + 1}`;
          
          const hectares = Math.round(props.CURRENT_SIZE || 0);
          const acres = Math.round(hectares * 2.47105);
          
          let status: 'Out of Control' | 'Being Monitored' | 'Under Control' = 'Out of Control';
          if (props.FIRE_STATUS === 'Under Control' || props.FIRE_STATUS === 'Out') {
            status = 'Under Control';
          } else if (props.FIRE_STATUS === 'Being Held' || props.FIRE_STATUS === 'Under Patrol') {
            status = 'Being Monitored';
          }

          return {
            id: `bcws-live-${props.FIRE_NUMBER || idx}`,
            name,
            country: 'CA',
            provinceOrState: 'British Columbia',
            latitude: coords[1],
            longitude: coords[0],
            hectaresBurned: hectares,
            acresBurned: acres,
            containmentPercentage: status === 'Under Control' ? 100 : (status === 'Being Monitored' ? 65 : 15),
            status,
            agency: `BC Wildfire Service (${props.FIRE_CENTRE || 'BCWS'})`,
            cause: props.FIRE_CAUSE || 'Under Investigation',
            updatedAt: props.UPDATE_DATE ? new Date(props.UPDATE_DATE).toISOString() : new Date().toISOString(),
            officialBulletinUrl: 'https://wildfiresituation.nrs.gov.bc.ca/incidents'
          };
        });
        allIncidents.push(...liveBcIncidents);
      }
    }
  } catch (e) {
    console.warn('BC Wildfire Service API error:', e);
  }

  // 2. Fetch live CWFIS (Natural Resources Canada / Canadian Wildland Fire Information System) Active Fires GeoJSON feed
  try {
    const cwfisUrl = 'https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=public:activefires_current&outputFormat=application/json';
    const res = await fetch(cwfisUrl);
    if (res.ok) {
      const data = await res.json();
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

        // Filter out duplicate BC fires that were already fetched from BCWS
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
