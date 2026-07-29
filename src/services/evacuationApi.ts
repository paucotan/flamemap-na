import { EvacuationAlert } from '../types/fire';

export async function fetchEvacuationAlerts(): Promise<EvacuationAlert[]> {
  const liveAlerts: EvacuationAlert[] = [];

  // 1. Fetch official BC Wildfire Evacuation Orders and Alerts from BC Government ArcGIS REST service
  try {
    const bcEvacUrl = 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson';
    const res = await fetch(bcEvacUrl);
    if (res.ok) {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && data.features && data.features.length > 0) {
        // Group raw features by incident event key (e.g. EVENT_NUMBER like C40983 or clean event name)
        const groupedMap = new Map<string, {
          eventNumber: string;
          name: string;
          hasOrder: boolean;
          hasAlert: boolean;
          agencies: Set<string>;
          totalPop: number;
          latestTime: number;
          coords: [number, number];
        }>();

        data.features.forEach((f: any, idx: number) => {
          const props = f.properties || {};
          let coords: [number, number] = [-121.5, 51.0];

          if (f.geometry) {
            if (f.geometry.type === 'Point') {
              coords = f.geometry.coordinates;
            } else if (f.geometry.type === 'Polygon' && f.geometry.coordinates?.[0]?.[0]) {
              coords = f.geometry.coordinates[0][0];
            } else if (f.geometry.type === 'MultiPolygon' && f.geometry.coordinates?.[0]?.[0]?.[0]) {
              coords = f.geometry.coordinates[0][0][0];
            }
          }

          const eventNum = props.EVENT_NUMBER || '';
          const rawName = props.ORDER_ALERT_NAME || props.EVENT_NAME || `Evacuation Zone #${idx + 1}`;
          
          // Normalize clean name key (e.g. "pear lake wildfire" -> "Pear Lake Wildfire")
          const cleanName = rawName.replace(/ Area \d*| Area| - Bonaparte First Nation| - Bonaparte/gi, '').trim();
          const groupKey = eventNum ? `fire-${eventNum}` : `name-${cleanName.toLowerCase()}`;

          const isOrder = props.ORDER_ALERT_STATUS === 'Order';
          const isAlert = props.ORDER_ALERT_STATUS === 'Alert' || props.ORDER_ALERT_STATUS === 'Warning';
          const agency = props.ISSUING_AGENCY || 'EmergencyInfoBC';
          const homes = props.MULTI_SOURCED_HOMES || 0;
          const pop = homes > 0 ? homes * 2.5 : (props.MULTI_SOURCED_POPULATION || 250);
          const issuedTime = props.DATE_MODIFIED || props.EVENT_START_DATE || Date.now();

          if (!groupedMap.has(groupKey)) {
            groupedMap.set(groupKey, {
              eventNumber: eventNum,
              name: cleanName,
              hasOrder: isOrder,
              hasAlert: isAlert,
              agencies: new Set([agency]),
              totalPop: Math.round(pop),
              latestTime: issuedTime,
              coords,
            });
          } else {
            const existing = groupedMap.get(groupKey)!;
            if (isOrder) existing.hasOrder = true;
            if (isAlert) existing.hasAlert = true;
            existing.agencies.add(agency);
            existing.totalPop += Math.round(pop);
            if (issuedTime > existing.latestTime) {
              existing.latestTime = issuedTime;
              existing.coords = coords;
            }
          }
        });

        const bcOfficialAlerts: EvacuationAlert[] = Array.from(groupedMap.entries()).map(([key, item], idx) => {
          const statusType = item.hasOrder ? 'Order' : 'Warning';
          const agencyList = Array.from(item.agencies).join(', ');
          const title = item.eventNumber ? `${item.name} (${item.eventNumber})` : item.name;

          return {
            id: `bc-evac-grouped-${key}-${idx}`,
            titleEn: `EVACUATION ${statusType.toUpperCase()} — ${title}`,
            titleFr: `ÉVACUATION ${statusType.toUpperCase() === 'ORDER' ? 'ORDRE' : 'ALERTE'} — ${title}`,
            type: statusType as 'Order' | 'Warning',
            region: 'British Columbia',
            country: 'CA',
            affectedPopulationApprox: Math.round(item.totalPop),
            issuedAt: new Date(item.latestTime).toISOString(),
            summaryEn: `Official evacuation ${item.hasOrder && item.hasAlert ? 'order & alert' : statusType.toLowerCase()} issued for ${title}. Jurisdictions involved: ${agencyList}.`,
            summaryFr: `Évacuation officielle mise en place pour ${title}. Autorités impliquées: ${agencyList}.`,
            officialUrl: 'https://www.emergencyinfobc.gov.bc.ca/',
            authorityName: agencyList.length > 45 ? `${item.agencies.size} Issuing Authorities (EmergencyInfoBC)` : agencyList,
            coordinates: item.coords,
          };
        });

        liveAlerts.push(...bcOfficialAlerts);
      }
    }
  } catch (e) {
    console.warn('BC Official Evacuation Orders API fetch error:', e);
  }

  // 2. Fetch real-time active major road closures and wildfire traffic hazards from DriveBC Open511 API
  try {
    const res = await fetch('https://api.open511.gov.bc.ca/events?status=ACTIVE&event_type=INCIDENT');
    if (res.ok) {
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        const driveBcAlerts: EvacuationAlert[] = data.events
          .filter((ev: any) => {
            const desc = (ev.description || '').toLowerCase();
            return (ev.severity === 'MAJOR' || desc.includes('road closed') || desc.includes('wildfire') || desc.includes('evacuation')) && ev.geography;
          })
          .slice(0, 10)
          .map((ev: any, idx: number) => {
            const isFire = (ev.event_subtypes || []).includes('FIRE') || ev.description?.toLowerCase().includes('wildfire');
            const coords: [number, number] = ev.geography.type === 'Point' 
              ? ev.geography.coordinates 
              : ev.geography.coordinates[0];

            const headline = ev.roads?.[0]?.name ? `${ev.roads[0].name} Road Closure` : 'Highway Emergency Alert';
            const cleanDesc = ev.description ? ev.description.replace(/\n/g, ' ') : 'Road closed due to active emergency incident.';

            const issuedDate = ev.created_at || ev.updated_at || ev.created || ev.updated || new Date().toISOString();

            return {
              id: `drivebc-${ev.id || idx}`,
              titleEn: `ROAD CLOSURE (DriveBC) — ${headline}`,
              titleFr: `FERMETURE DE ROUTE (DriveBC) — ${headline}`,
              type: (isFire ? 'Order' : 'Warning') as 'Order' | 'Warning',
              region: 'British Columbia',
              country: 'CA',
              affectedPopulationApprox: isFire ? 1500 : 500,
              issuedAt: issuedDate,
              summaryEn: cleanDesc,
              summaryFr: cleanDesc,
              officialUrl: ev.url ? ev.url.replace('api.open511.gov.bc.ca/events', 'www.drivebc.ca') : 'https://www.drivebc.ca',
              authorityName: 'DriveBC / BC Ministry of Transportation',
              driveBcUrl: 'https://www.drivebc.ca',
              coordinates: coords,
            };
          });

        liveAlerts.push(...driveBcAlerts);
      }
    }
  } catch (e) {
    console.warn('DriveBC API fetch error:', e);
  }

  // 3. Filter to entries issued within the last 7 days (aligning with timeline window)
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 3600 * 1000;
  const recentAlerts = liveAlerts.filter(alert => {
    const time = new Date(alert.issuedAt).getTime();
    return !isNaN(time) && time >= sevenDaysAgoMs;
  });

  return recentAlerts;
}
