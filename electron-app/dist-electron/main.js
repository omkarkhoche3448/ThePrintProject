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
  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:8080");
  } else {
    const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
    mainWindow.loadFile(path.join(__dirname2, "../dist/index.html"));
  }
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
