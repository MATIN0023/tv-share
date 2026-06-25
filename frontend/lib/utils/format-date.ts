export function formatFaDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fa-IR");
  } catch {
    return iso;
  }
}

export function formatFaNumber(n: number): string {
  return n.toLocaleString("fa-IR");
}
