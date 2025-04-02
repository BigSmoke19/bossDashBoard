import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";

let mainWindow;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "images", "logos.png"), // Use path.join for cross-platform compatibility
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Correct preload path
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      autofill: false,
      
    },
  });

  mainWindow.maximize();

  // Use a conditional to load URLs for development and production
  const startURL = isDev
    ? "http://localhost:3000" // Development mode: Load React's dev server
    : `file://${path.join(__dirname, "../build/index.html")}`; // Production mode: Load the built app

  mainWindow.loadURL(startURL);
});


ipcMain.handle("show-confirm-dialog", async (event, options) => {
  const response = await dialog.showMessageBox(mainWindow, {
    type: "question",
    buttons: ["Yes", "Cancel"],
    defaultId: 1, // Default button index (Cancel)
    title: options.title || "Confirm",
    message: options.message || "Are you sure you want to proceed?",
    noLink: true,
  });

  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize(); // Restore the window if it's already maximized
      } else {
        mainWindow.maximize(); // Maximize the window
      }
    }
  });


  // Returns the index of the button clicked (0 for "Yes", 1 for "Cancel")
  return response.response;
});
