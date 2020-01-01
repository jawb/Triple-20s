const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { init, skipFor, close } = require("./app");

const isMac = process.platform === "darwin";
if (isMac) app.dock.hide();

let lockWindow;
let tray = null;
let preventClose = () => keepLock();

function showLockWindow() {
  lockWindow = new BrowserWindow({
    show: false,
    frame: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  lockWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  lockWindow.on("closed", () => (lockWindow = null));
  if (isMac) lockWindow.setAutoHideCursor(true);
  lockWindow.setKiosk(true);
  lockWindow.setFullScreen(true);
  lockWindow.on("blur", preventClose);
  lockWindow.show();
  lockWindow.moveTop();
  lockWindow.focus();
}

function keepLock() {
  lockWindow.moveTop();
  lockWindow.focus();
}

function hideLockWindow() {
  lockWindow.setKiosk(false);
  lockWindow.setFullScreen(false);
  lockWindow.destroy();
}

function updateTray(title) {
  tray.setTitle(title);
}

app.on("ready", () => {
  init(showLockWindow, hideLockWindow, updateTray);
  tray = new Tray(path.join(__dirname, "./tray.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Skip breaks for", type: "normal", enabled: false },
    { label: "30 Minutes", type: "normal", click: skipFor("30min") },
    { label: "1 Hour", type: "normal", click: skipFor("1h") },
    { label: "2 Hours", type: "normal", click: skipFor("2h") },
    { label: "4 Hours", type: "normal", click: skipFor("4h") },
    { label: "Tomorrow", type: "normal", click: skipFor("tomorrow") },
    { label: "No skipping", type: "normal", click: skipFor("noskip") },
    { type: "separator" },
    { label: "Quit", type: "normal", role: "quit" }
  ]);
  tray.setToolTip("Triple 20s");
  tray.setContextMenu(contextMenu);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    close();
    app.quit();
  }
});

app.on("activate", () => {
  if (lockWindow === null) createLockWindow();
});

if (!isDev) {
  const exeName = path.basename(process.execPath);
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    args: [
      "--processStart",
      `"${exeName}"`,
      "--process-start-args",
      `"--hidden"`
    ]
  });
}
