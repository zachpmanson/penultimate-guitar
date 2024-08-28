export function dedupe<T>(arr: any[]): T[] {
  return [...new Set(arr)];
}
