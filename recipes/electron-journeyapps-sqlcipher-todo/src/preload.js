const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("todos", {
  list: () => ipcRenderer.invoke("todos:list"),
  create: (title) => ipcRenderer.invoke("todos:create", title),
  update: (todo) => ipcRenderer.invoke("todos:update", todo),
  delete: (id) => ipcRenderer.invoke("todos:delete", id)
});
