# Electron Encrypted SQLite Todo

A small cross-platform Electron CRUD application backed by an encrypted SQLite database. It extends the minimal packaging recipe with [`better-sqlite3-multiple-ciphers`](https://github.com/m4heshd/better-sqlite3-multiple-ciphers) and packages the native module for macOS and Windows with `electron-builder`.

## Features

- Create, read, update, complete, and delete todos
- Encrypted SQLite storage using the default `sqleet` cipher
- Database stored in Electron's platform-specific `userData` directory
- Context-isolated and sandboxed renderer with a narrow preload API
- macOS DMG and ZIP targets
- Windows NSIS installer and portable executable targets

## Requirements

- Node.js 22 or later
- npm
- Native build tools if a prebuilt binary is unavailable for the target platform

## Run locally

```sh
npm install
npm start
```

The `postinstall` script rebuilds the native database module for the installed Electron version.

Run the CRUD and encrypted-file smoke test:

```sh
npm test
```

## Build distributable packages

Build for the current platform:

```sh
npm run build
```

Build macOS DMG and ZIP packages on macOS:

```sh
npm run build:mac
```

Build Windows NSIS and portable packages on Windows:

```sh
npm run build:win
```

Generated files are written to `dist/`. Run each target on its native operating system for reliable verification. Code signing and macOS notarization are intentionally outside the scope of this recipe.

## Database location

The database is named `todos.db` and stored under Electron's `userData` directory:

- macOS: `~/Library/Application Support/Encrypted Todo/`
- Windows: `%APPDATA%/Encrypted Todo/`

The SQLite file header is encrypted and cannot be opened as a normal unencrypted SQLite database.

## Encryption key warning

This recipe intentionally uses a hard-coded demonstration key so the example stays focused on native-module packaging and CRUD behavior. A production application must not ship its database key in source code. Store or derive the key using an appropriate platform-backed secret-storage design.
