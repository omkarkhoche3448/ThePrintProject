import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const isSquirrelStartup = process.argv.some((arg) => arg.includes("--squirrel"));
if (isSquirrelStartup) {
  app.quit();
}
const isDevelopment = process.env.ELECTRON === "true";
let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  try {
    mainWindow.webContents.openDevTools();
    console.log("Opened DevTools immediately");
  } catch (e) {
    console.error("Failed to open DevTools immediately:", e);
  }
  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:8080").catch((e) => {
      console.error("Failed to load dev URL:", e);
    }).finally(() => {
      mainWindow == null ? void 0 : mainWindow.webContents.openDevTools();
    });
  } else {
    const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
    mainWindow.loadFile(path.join(__dirname2, "../dist/index.html"));
    mainWindow.webContents.openDevTools();
  }
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Window finished loading, opening DevTools");
    mainWindow == null ? void 0 : mainWindow.webContents.openDevTools();
  });
  mainWindow.webContents.on("dom-ready", () => {
    console.log("DOM ready, opening DevTools");
    mainWindow == null ? void 0 : mainWindow.webContents.openDevTools();
  });
  mainWindow.once("ready-to-show", () => {
    console.log("Window ready to show, opening DevTools");
    mainWindow == null ? void 0 : mainWindow.webContents.openDevTools();
  });
  [500, 1e3, 2e3, 3e3, 5e3].forEach((delay) => {
    setTimeout(() => {
      try {
        if (mainWindow && !mainWindow.webContents.isDevToolsOpened()) {
          console.log(`Trying to open DevTools after ${delay}ms`);
          mainWindow.webContents.openDevTools();
        }
      } catch (error) {
        console.error(`Failed to open DevTools after ${delay}ms:`, error);
      }
    }, delay);
  });
};
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
