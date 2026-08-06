export function isWithinCoverage(lat: number, lng: number): boolean {
  return lat >= -9.72 && lat <= -9.45 && lng >= -35.83 && lng <= -35.63;
}

export const MACEIO_CENTER: [number, number] = [-35.73, -9.585];
