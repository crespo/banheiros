export function parseOpeningHours(raw: string): { open_time: string; close_time: string } | null {
  if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(raw)) return null;
  const [open_time, close_time] = raw.split("-");
  return { open_time, close_time };
}
