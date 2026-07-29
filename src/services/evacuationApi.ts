import { EvacuationAlert } from '../types/fire';

export async function fetchEvacuationAlerts(): Promise<EvacuationAlert[]> {
  const liveAlerts: EvacuationAlert[] = [];

  // Fetch real-time active major road closures and wildfire traffic hazards from DriveBC Open511 API
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

  return liveAlerts;
}
