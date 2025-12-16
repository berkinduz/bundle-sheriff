import bytes from "bytes";

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "n/a";
  return bytes(value, { unitSeparator: " " });
}
