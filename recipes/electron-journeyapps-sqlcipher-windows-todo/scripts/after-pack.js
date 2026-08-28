const fs = require("node:fs");
const path = require("node:path");

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;

  const runtimeDirectory = path.join(__dirname, "..", ".windows-openssl");
  const runtimeFiles = ["libcrypto-3-x64.dll", "libssl-3-x64.dll"];

  for (const fileName of runtimeFiles) {
    const source = path.join(runtimeDirectory, fileName);
    if (!fs.existsSync(source)) {
      throw new Error(`Staged OpenSSL runtime is missing: ${source}`);
    }
    fs.copyFileSync(source, path.join(context.appOutDir, fileName));
  }
};
