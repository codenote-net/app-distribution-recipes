const values = {
  platform: window.systemInfo.platform,
  electron: window.systemInfo.versions.electron,
  chrome: window.systemInfo.versions.chrome,
  node: window.systemInfo.versions.node
};

for (const [id, value] of Object.entries(values)) {
  document.getElementById(id).textContent = value;
}
