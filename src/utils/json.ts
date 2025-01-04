export function safeJsonParse<R>(json: string): R | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}
