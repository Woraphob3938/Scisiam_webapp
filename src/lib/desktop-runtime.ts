declare global {
  interface Window {
    __SCISIAM_DESKTOP__?: boolean;
  }
}

export function isScisiamDesktop() {
  return typeof window !== "undefined" && window.__SCISIAM_DESKTOP__ === true;
}

const DESKTOP_OAUTH_BROWSER_OPEN_ERROR =
  "เปิดเบราว์เซอร์เพื่อเข้าสู่ระบบ Google ไม่สำเร็จ กรุณาตรวจสอบเบราว์เซอร์เริ่มต้นแล้วลองใหม่อีกครั้ง";

export function getDesktopOAuthError(search: string) {
  const error = new URLSearchParams(search).get("desktop-oauth-error");
  return error === "browser-open-failed" ? DESKTOP_OAUTH_BROWSER_OPEN_ERROR : "";
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
