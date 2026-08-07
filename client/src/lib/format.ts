// Pure formatting helpers — no JSX, no component state. Single source of
// truth so every screen displays money and time identically.

export function formatINR(amountInRupees: number): string {
  return '₹' + (amountInRupees / 100000).toFixed(1) + 'L';
}

export function formatClockTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString();
}
