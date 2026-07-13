const APP_ORIGIN = "https://scisiam-app.vercel.app";
const CONNECTION_TIMEOUT_MS = 8_000;
const status = document.querySelector("#status");
const actions = document.querySelector("#actions");
const retry = document.querySelector("#retry");
const browserFallback = document.querySelector("#actions a");

browserFallback.href = `${APP_ORIGIN}/?desktop-browser=1`;

async function connect() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT_MS);
  status.textContent = "กำลังเชื่อมต่อห้องแล็บ...";
  actions.hidden = true;
  try {
    await fetch(`${APP_ORIGIN}/favicon.png?desktop-check=${Date.now()}`, {
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    window.location.replace(APP_ORIGIN);
  } catch {
    status.textContent = "เชื่อมต่อ Scisiam ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
    actions.hidden = false;
  } finally {
    clearTimeout(timeout);
  }
}

retry.addEventListener("click", connect);
void connect();
