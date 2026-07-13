declare global {
  interface Window {
    __SCISIAM_DESKTOP__?: boolean;
  }
}

export function isScisiamDesktop() {
  return typeof window !== "undefined" && window.__SCISIAM_DESKTOP__ === true;
}

export function getGoogleOAuthOptions(origin: string, desktop: boolean) {
  return {
    redirectTo: desktop
      ? "scisiam://auth/callback"
      : `${origin}/auth/oauth-callback?next=/profile`,
    skipBrowserRedirect: desktop,
    queryParams: { prompt: "select_account" },
  };
}
