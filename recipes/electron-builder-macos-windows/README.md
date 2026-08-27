# Electron Builder for macOS and Windows

A minimal Electron application that displays the current platform and the bundled Electron, Chrome, and Node.js versions. It uses `electron-builder` to produce distributable packages for macOS and Windows.

## Requirements

- Node.js 22 or later
- npm

## Run locally

```sh
npm install
npm start
```

## Build distributable packages

Build for the current platform:

```sh
npm run build
```

Build macOS DMG and ZIP packages:

```sh
npm run build:mac
```

Build Windows NSIS installer and portable executable:

```sh
npm run build:win
```

Generated files are written to `dist/`.

For reliable production builds, run each target on its native operating system. Code signing and macOS notarization are intentionally outside the scope of this minimal recipe.

## Project structure

```text
.
├── package.json
└── src
    ├── index.html
    ├── main.js
    ├── preload.js
    ├── renderer.js
    └── styles.css
```
