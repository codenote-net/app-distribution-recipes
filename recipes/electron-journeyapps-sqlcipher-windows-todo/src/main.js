const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");
const TodoDatabase = require("./database");

const DATABASE_KEY = "replace-this-demo-key-before-production";
let todoDatabase;

app.setName("JourneyApps SQLCipher Windows Todo");

function createWindow() {
  const window = new BrowserWindow({
    width: 760,
    height: 680,
    minWidth: 560,
    minHeight: 520,
    title: "JourneyApps SQLCipher Windows Todo",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.loadFile(path.join(__dirname, "index.html"));
}

function registerTodoHandlers() {
  ipcMain.handle("todos:list", () => todoDatabase.list());
  ipcMain.handle("todos:create", (_event, title) => todoDatabase.create(title));
  ipcMain.handle("todos:update", (_event, todo) => todoDatabase.update(todo));
  ipcMain.handle("todos:delete", (_event, id) => todoDatabase.delete(id));
}

app.whenReady().then(async () => {
  todoDatabase = await TodoDatabase.open(path.join(app.getPath("userData"), "todos.db"), DATABASE_KEY);
  registerTodoHandlers();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((error) => {
  console.error(error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  for (const channel of ["todos:list", "todos:create", "todos:update", "todos:delete"]) {
    ipcMain.removeHandler(channel);
  }
  void todoDatabase?.close();
});
