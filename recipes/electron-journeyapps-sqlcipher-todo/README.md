# Electron Todo with JourneyApps SQLCipher

An Electron CRUD application backed by an encrypted SQLite database using [`@journeyapps/sqlcipher`](https://github.com/journeyapps/node-sqlcipher). It demonstrates the package's source-build integration with Electron and `electron-builder` on macOS.

## Platform support

| Platform | Status |
| --- | --- |
| macOS | Supported and packaged by this recipe |
| Linux | Supported by the library, but not packaged by this recipe |
| Windows | Not supported by `@journeyapps/sqlcipher` 6.0.0 |

The library currently builds native bindings from source and explicitly does not support Windows or publish prebuilt binaries. Use the sibling [`better-sqlite3-multiple-ciphers` recipe](../electron-better-sqlite3-multiple-ciphers-todo/README.md) when both macOS and Windows support are required.

## Features

- Create, read, update, complete, and delete todos
- SQLCipher 4 encrypted SQLite storage
- Database stored in Electron's platform-specific `userData` directory
- Context-isolated and sandboxed renderer with a narrow preload API
- macOS DMG and ZIP targets
- Automated CRUD and encrypted-header smoke test

## Requirements

- Node.js 22 or later
- npm
- Xcode Command Line Tools

## Install and run

```sh
npm install
npm start
```

The dependency and the `postinstall` script compile the native addon from source, first for Node.js and then for the installed Electron version.

## Test

```sh
npm test
```

The smoke test exercises CRUD operations and confirms that the database does not expose the normal unencrypted SQLite header.

## Build macOS packages

```sh
npm run build:mac
```

Generated DMG and ZIP files are written to `dist/`. Code signing and notarization are intentionally outside the scope of this recipe.

## Reproduce the unsupported Windows build

The project includes a Windows x64 target only to make the current incompatibility reproducible:

```sh
npm run build:win
```

This command is expected to fail while rebuilding the native `@journeyapps/sqlcipher` addon. Do not disable the native rebuild to force package generation: that could place a host-platform binary in a Windows package and create an executable that only fails at runtime.

## Database location

The database is named `todos.db` and stored at:

```text
~/Library/Application Support/JourneyApps SQLCipher Todo/todos.db
```

## Encryption key warning

This recipe intentionally uses a hard-coded demonstration key so the example stays focused on native-module packaging and CRUD behavior. A production application must not ship its database key in source code. Store or derive the key using an appropriate platform-backed secret-storage design.

## Implementation difference

Unlike `better-sqlite3-multiple-ciphers`, this package exposes the asynchronous `node-sqlite3` callback API. The database wrapper converts those callbacks to promises before exposing operations through Electron IPC.
