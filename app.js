// Importing required modules
const { app, BrowserWindow, Menu, ipcMain, shell, Tray } = require("electron");
const path = require("path");

// Initializing variables
let mainWindow = null;
let aboutWindow = null;
const trayIcon = path.join(__dirname, "bible.png");

// Function to create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: app.isPackaged ? 300 : 1024,
    height: app.isPackaged ? 150 : 627,
    minHeight: 150,
    minWidth: 300,
    show: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    modal: true,
    icon: path.join(__dirname, "bible.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Loading HTML file into main window
  mainWindow.loadFile("web/index.html");

  // Opening developer tools if not packaged
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Event listeners for window close and ready-to-show
  mainWindow.on("closed", () => {
    mainWindow = null;
    app.quit();
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
}

// Function to create the about window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    frame: false,
    width: app.isPackaged ? 250 : 1024,
    height: app.isPackaged ? 300 : 627,
    minHeight: 300,
    minWidth: 250,
    show: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    parent: mainWindow,
    icon: path.join(__dirname, "bible.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Loading HTML file into about window
  aboutWindow.loadFile("web/about.html");

  // Opening developer tools if not packaged
  if (!app.isPackaged) {
    aboutWindow.webContents.openDevTools();
  }

  // Event listeners for window close and ready-to-show
  aboutWindow.on("closed", () => {
    aboutWindow = null;
  });

  aboutWindow.on("ready-to-show", () => {
    aboutWindow.show();
  });
}

// Event listener when Electron is ready
app.on("ready", () => {
  // Creating main window
  createMainWindow();

  // Creating application menu
  const menuTemplate = [
    {
      label: "Copy",
      click: () => {
        mainWindow.webContents.send("copy");
      },
    },
    {
      label: "Change Version",
      submenu: [
        {
          label: "kjv",
          click: () => {
            mainWindow.webContents.send("changeUrl", "kjv");
          },
        },
        {
          label: "nkjv",
          click: () => {
            mainWindow.webContents.send("changeUrl", "nkjv");
          },
        },
        {
          label: "French",
          click: () => {
            mainWindow.webContents.send("changeUrl", "french");
          },
        },
        {
          label: "Russian",
          click: () => {
            mainWindow.webContents.send("changeUrl", "russian");
          },
        },
      ],
    },
    {
      label: "Always On Top",
      submenu: [
        {
          label: "True",
          type: "radio",
          checked: true,
          click: (e) => {
            mainWindow.webContents.send("topTrue", e.checked);
            console.log(e.checked);
            mainWindow.setAlwaysOnTop(true);
          },
        },
        {
          label: "False",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("topFalse");
            mainWindow.setAlwaysOnTop(false);
          },
        },
      ],
    },
    {
      label: "Timer",
      submenu: [
        {
          label: "5 s",
          type: "radio",
          checked: true,
          click: (e) => {
            mainWindow.webContents.send("timer", 5);
          },
        },
        {
          label: "10 s",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 10);
          },
        },
        {
          label: "30 s",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 30);
          },
        },
        {
          label: "1 min",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 60);
          },
        },
        {
          label: "5 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 5 * 1000);
          },
        },
        {
          label: "10 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 10 * 1000);
          },
        },
        {
          label: "20 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 20 * 1000);
          },
        },
        {
          label: "30 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 30 * 1000);
          },
        },
      ],
    },
    {
      label: "about",
      click: () => {
        createAboutWindow();
      },
    },

    {
      label: "Quit",
      click: () => app.quit(),
    },
  ];

  // Pushing developer tools and reload into menu template if not packaged
  if (!app.isPackaged) {
    menuTemplate.push({ role: "toggleDevTools" });
    menuTemplate.push({ role: "reload" });
  }

  // Building application menu from template
  const menu = Menu.buildFromTemplate(menuTemplate);

  // Setting application menu
  Menu.setApplicationMenu(menu);

  // Context menu for main window
  mainWindow.webContents.on("context-menu", (e, params) => {
    e.preventDefault();
    menu.popup(mainWindow, params.x, params.y);
  });

  // Tray menu
  const trayMenu = new Tray(trayIcon);
  trayMenu.setContextMenu(menu);
  trayMenu.setToolTip("Bible Verse Desktop");
});

// Quit application when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Recreate main window if activated when it's null
app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Event listener for handling "Always On Top" setting changes
ipcMain.on("top", (e, top) => {
  if (top === "True") return mainWindow.setAlwaysOnTop(true);
  return mainWindow.setAlwaysOnTop(false);
});

// Event listener for closing the about window
ipcMain.on("close-about", () => {
  aboutWindow.close();
});

// Event listener for opening an external URL
ipcMain.on("open-url", () => {
  shell.openExternal("https://oluegwuc.netlify.app/");
});
