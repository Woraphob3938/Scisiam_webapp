const ENCODED_NAVIGATION_CONTROL_PATTERN = /%(?:00|0a|0d|5c)/i;
const RAW_NAVIGATION_CONTROL_PATTERN = /[\\\0\r\n]/;

export function getSafeSameOriginPath(
  requestedPath: string | null | undefined,
  fallback: string,
  blockedPrefixes: readonly string[] = [],
): string {
  if (
    !requestedPath?.startsWith("/") ||
    requestedPath.startsWith("//") ||
    RAW_NAVIGATION_CONTROL_PATTERN.test(requestedPath) ||
    ENCODED_NAVIGATION_CONTROL_PATTERN.test(requestedPath)
  ) {
    return fallback;
  }

  try {
    const base = new URL("https://scisiam.invalid");
    const destination = new URL(requestedPath, base);
    if (
      destination.origin !== base.origin ||
      blockedPrefixes.some((prefix) => destination.pathname.startsWith(prefix))
    ) {
      return fallback;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
