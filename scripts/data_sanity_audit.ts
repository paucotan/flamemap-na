import { fetchCanadianIncidents } from '../src/services/cwfisApi.js';
import { fetchFirmsHotspots } from '../src/services/firmsApi.js';
import { fetchUSIncidents } from '../src/services/nifcApi.js';
import { fetchEvacuationOrders } from '../src/services/evacuationApi.js';

export interface AuditResult {
  source: string;
  totalRecords: number;
  validGeoCount: number;
  invalidGeoCount: number;
  staleCount: number;
  warnings: string[];
  status: 'PASSED' | 'WARNING' | 'FAILED';
  groundTruthMatches?: string[];
}

// Key active Canadian fire keywords to verify against live news ground-truth
const KNOWN_GROUND_TRUTH_FIRES = [
  'pear lake', 'french bar', 'ainslie', 'kimberley', 'clinton', 'logan lake', 'bc wildfire'
];

export async function auditDataSanity(): Promise<AuditResult[]> {
  console.log('🔍 Executing Data Sanity & Ground-Truth Verification Audit...\n');
  const results: AuditResult[] = [];

  // 1. Audit Canadian Incidents (BCWS + CWFIS)
  try {
    console.log('  -> Fetching Canadian Wildfire Incidents (BCWS + CWFIS)...');
    const caIncidents = await fetchCanadianIncidents();
    let validGeo = 0;
    let invalidGeo = 0;
    let stale = 0;
    const warnings: string[] = [];
    const matchedFires: string[] = [];

    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const inc of caIncidents) {
      // Geo bounds for Canada
      if (inc.latitude >= 41.6 && inc.latitude <= 83.1 && inc.longitude >= -141.0 && inc.longitude <= -52.6) {
        validGeo++;
      } else {
        invalidGeo++;
        warnings.push(`Invalid Geo for ${inc.id} (${inc.name}): [${inc.latitude}, ${inc.longitude}]`);
      }

      const updatedTime = new Date(inc.updatedAt).getTime();
      if (isNaN(updatedTime) || now - updatedTime > SEVEN_DAYS_MS) {
        stale++;
      }

      // Check ground-truth matches
      const nameLower = inc.name.toLowerCase();
      for (const groundTruthName of KNOWN_GROUND_TRUTH_FIRES) {
        if (nameLower.includes(groundTruthName) && !matchedFires.includes(inc.name)) {
          matchedFires.push(inc.name);
        }
      }
    }

    if (caIncidents.length === 0) {
      warnings.push('Zero Canadian incidents returned from API feeds.');
    }

    results.push({
      source: 'Canada Incidents (BCWS + CWFIS)',
      totalRecords: caIncidents.length,
      validGeoCount: validGeo,
      invalidGeoCount: invalidGeo,
      staleCount: stale,
      warnings,
      status: invalidGeo > 0 || caIncidents.length === 0 ? 'FAILED' : (stale > caIncidents.length * 0.5 ? 'WARNING' : 'PASSED'),
      groundTruthMatches: matchedFires
    });
  } catch (err: any) {
    results.push({
      source: 'Canada Incidents',
      totalRecords: 0,
      validGeoCount: 0,
      invalidGeoCount: 0,
      staleCount: 0,
      warnings: [`API Exception: ${err.message}`],
      status: 'FAILED'
    });
  }

  // 2. Audit US Incidents (NIFC)
  try {
    console.log('  -> Fetching US Wildfire Incidents (NIFC)...');
    const usIncidents = await fetchUSIncidents();
    let validGeo = 0;
    let invalidGeo = 0;
    let stale = 0;
    const warnings: string[] = [];
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const inc of usIncidents) {
      if (inc.latitude >= 18.0 && inc.latitude <= 72.0 && inc.longitude >= -180.0 && inc.longitude <= -65.0) {
        validGeo++;
      } else {
        invalidGeo++;
        warnings.push(`Invalid Geo for ${inc.id} (${inc.name}): [${inc.latitude}, ${inc.longitude}]`);
      }

      const updatedTime = new Date(inc.updatedAt).getTime();
      if (isNaN(updatedTime) || now - updatedTime > SEVEN_DAYS_MS) {
        stale++;
      }
    }

    results.push({
      source: 'US Incidents (NIFC)',
      totalRecords: usIncidents.length,
      validGeoCount: validGeo,
      invalidGeoCount: invalidGeo,
      staleCount: stale,
      warnings,
      status: invalidGeo > 0 || usIncidents.length === 0 ? 'FAILED' : 'PASSED'
    });
  } catch (err: any) {
    results.push({
      source: 'US Incidents',
      totalRecords: 0,
      validGeoCount: 0,
      invalidGeoCount: 0,
      staleCount: 0,
      warnings: [`API Exception: ${err.message}`],
      status: 'FAILED'
    });
  }

  // 3. Audit FIRMS Satellite Data
  try {
    console.log('  -> Fetching NASA FIRMS Satellite Hotspots...');
    const firms = await fetchFirmsHotspots();
    let validGeo = 0;
    let invalidGeo = 0;
    const warnings: string[] = [];

    for (const hotspot of firms) {
      if (hotspot.latitude >= 24.0 && hotspot.latitude <= 83.1 && hotspot.longitude >= -170.0 && hotspot.longitude <= -50.0) {
        validGeo++;
      } else {
        invalidGeo++;
        warnings.push(`Invalid Geo for FIRMS hotspot: [${hotspot.latitude}, ${hotspot.longitude}]`);
      }
    }

    results.push({
      source: 'NASA FIRMS Satellite Hotspots',
      totalRecords: firms.length,
      validGeoCount: validGeo,
      invalidGeoCount: invalidGeo,
      staleCount: 0,
      warnings,
      status: invalidGeo > 0 ? 'FAILED' : (firms.length === 0 ? 'WARNING' : 'PASSED')
    });
  } catch (err: any) {
    results.push({
      source: 'NASA FIRMS Satellite',
      totalRecords: 0,
      validGeoCount: 0,
      invalidGeoCount: 0,
      staleCount: 0,
      warnings: [`API Exception: ${err.message}`],
      status: 'FAILED'
    });
  }

  // 4. Audit Evacuation Orders
  try {
    console.log('  -> Fetching Evacuation Orders...');
    const evacs = await fetchEvacuationOrders();
    let validGeo = 0;
    let invalidGeo = 0;
    const warnings: string[] = [];

    for (const evac of evacs) {
      if (evac.latitude >= 41.6 && evac.latitude <= 83.1 && evac.longitude >= -141.0 && evac.longitude <= -52.6) {
        validGeo++;
      } else {
        invalidGeo++;
        warnings.push(`Invalid Geo for Evac ${evac.id} (${evac.title}): [${evac.latitude}, ${evac.longitude}]`);
      }
    }

    results.push({
      source: 'Evacuation Orders',
      totalRecords: evacs.length,
      validGeoCount: validGeo,
      invalidGeoCount: invalidGeo,
      staleCount: 0,
      warnings,
      status: invalidGeo > 0 ? 'FAILED' : 'PASSED'
    });
  } catch (err: any) {
    results.push({
      source: 'Evacuation Orders',
      totalRecords: 0,
      validGeoCount: 0,
      invalidGeoCount: 0,
      staleCount: 0,
      warnings: [`API Exception: ${err.message}`],
      status: 'FAILED'
    });
  }

  return results;
}
