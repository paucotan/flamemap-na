import { FireIncident } from '../types/fire';

export async function fetchUSIncidents(): Promise<FireIncident[]> {
  try {
    // Valid ArcGIS REST query using standard simple parameters outFields=*
    const url = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson';
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return [];
      }

      if (data && data.features && data.features.length > 0) {
        const liveParsed: FireIncident[] = data.features
          .filter((f: any) => f.geometry && f.geometry.coordinates && f.geometry.coordinates.length >= 2)
          .map((f: any, idx: number) => {
            const props = f.properties || {};
            const coords = f.geometry.coordinates; // [lng, lat]
            const rawName = props.IncidentName || `US Wildfire #${idx + 1}`;
            const name = rawName.toLowerCase().includes('fire') || rawName.toLowerCase().includes('complex') ? rawName : `${rawName} Fire`;
            const state = props.POOState || 'US';
            const acres = Math.round(props.IncidentSize || 0);
            const hectares = Math.round(acres * 0.404686);
            const containment = props.PercentContained !== null && props.PercentContained !== undefined ? props.PercentContained : 0;
            const agency = props.POOProtectingAgency || 'US Interagency Wildfire Service';

            return {
              id: `nifc-live-${idx}`,
              name,
              country: 'US',
              provinceOrState: state,
              latitude: coords[1],
              longitude: coords[0],
              acresBurned: acres,
              hectaresBurned: hectares,
              containmentPercentage: containment,
              status: containment < 50 ? 'Out of Control' : (containment < 90 ? 'Being Monitored' : 'Under Control'),
              agency,
              cause: 'Under Investigation',
              updatedAt: props.ModifiedOnDateTime_KG ? new Date(props.ModifiedOnDateTime_KG).toISOString() : new Date().toISOString(),
              officialBulletinUrl: state === 'CA' ? 'https://www.fire.ca.gov/incidents' : 'https://inciweb.wildfire.gov/'
            };
          });

        if (liveParsed.length > 0) {
          return liveParsed;
        }
      }
    }
  } catch (e) {
    console.warn('NIFC ArcGIS REST API query error:', e);
  }

  return [];
}
