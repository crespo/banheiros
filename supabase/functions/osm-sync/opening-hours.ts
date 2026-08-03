export function parseOpeningHours(raw: string): { open_time: string; close_time: string } {
  const [open_time, close_time] = raw.split("-");
  return { open_time, close_time };
}
