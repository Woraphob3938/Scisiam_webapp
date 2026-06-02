const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;
const { createServer } = require("http");
const next = require("next");

// Do not bundle API keys in the desktop app. Provide GEMINI_API_KEY from a
// trusted server/runtime environment instead.
process.env.GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let mainWindow;
let server;

async function startServer() {
  if (isDev) {
    // In dev mode, we assume Next.js is already running on port 3000
    return 3000;
  }
  
  // In production, we start Next.js programmatically on a random port
  const port = 3000 + Math.floor(Math.random() * 1000);
  const nextApp = next({ dev: false, dir: __dirname });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  server = createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve) => {
    server.listen(port, () => {
      resolve();
    });
  });
  return port;
}

app.on("ready", async () => {
  const port = await startServer();
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "SciSiam Virtual Lab",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
