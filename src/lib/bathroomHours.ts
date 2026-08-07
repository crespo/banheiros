function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(open: string, close: string, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (toMinutes(close) <= toMinutes(open)) return true;
  return toMinutes(open) <= nowMinutes && nowMinutes < toMinutes(close);
}
