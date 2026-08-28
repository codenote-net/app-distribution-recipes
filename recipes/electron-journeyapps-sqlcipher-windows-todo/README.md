# Electron Todo with JourneyApps SQLCipher and Windows OpenSSL

An Electron CRUD application that supplements `@journeyapps/sqlcipher` with the Windows OpenSSL dependencies and packaging steps that the library does not provide as a supported turnkey workflow.

## What this recipe adds

- Native Windows x64 compilation on a Windows runner
- OpenSSL headers and import libraries supplied by a pinned vcpkg revision
- OpenSSL runtime DLL packaging through an electron-builder `afterPack` hook
- Native addon and DLL presence checks before artifact upload
- macOS DMG/ZIP and Windows NSIS/portable targets
- Encrypted SQLite CRUD smoke tests

The recipe uses only public sources and does not depend on a private fork or unpublished binary.

## Local macOS usage

```sh
npm install
npm test
npm run build:mac
```

## Windows requirements

- Windows x64
- Node.js 26.8.1
- Visual Studio Build Tools with the C++ workload
- A vcpkg checkout containing `openssl:x64-windows`
- `VCPKG_ROOT` set to that vcpkg checkout

Prepare OpenSSL with vcpkg:

```powershell
vcpkg install openssl:x64-windows
$env:VCPKG_ROOT = "C:\path\to\vcpkg"
```

Install JavaScript dependencies without running the unsupported default native install, restore Electron, and build:

```powershell
npm ci --ignore-scripts
npm rebuild electron
npm run build:win
```

The build script stages OpenSSL into the paths expected by the package's public `binding.gyp`, rebuilds the addon for Electron x64, disables electron-builder's second rebuild, and copies the runtime DLLs into the packaged application.

## GitHub Actions

The repository workflow `.github/workflows/journeyapps-sqlcipher-windows.yml` performs the complete Windows build and uploads the installer and portable executable as a workflow artifact.

## Encryption key warning

This recipe uses a hard-coded demonstration key. A production application must use an appropriate platform-backed secret-storage design.
