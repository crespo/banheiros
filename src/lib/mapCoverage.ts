export const COVERAGE_BOUNDS = { minLat: -9.72, maxLat: -9.45, minLng: -35.83, maxLng: -35.63 };

export function isWithinCoverage(lat: number, lng: number): boolean {
  return lat >= COVERAGE_BOUNDS.minLat && lat <= COVERAGE_BOUNDS.maxLat && lng >= COVERAGE_BOUNDS.minLng && lng <= COVERAGE_BOUNDS.maxLng;
}

export const MACEIO_CENTER: [number, number] = [-35.73, -9.585];
