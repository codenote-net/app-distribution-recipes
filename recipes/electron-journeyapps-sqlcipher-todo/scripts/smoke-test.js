const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app } = require("electron");
const TodoDatabase = require("../src/database");

app.whenReady().then(async () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "journeyapps-sqlcipher-todo-test-"));
  const databasePath = path.join(temporaryDirectory, "todos.db");
  let database;

  try {
    database = await TodoDatabase.open(databasePath, "smoke-test-key");
    assert.deepEqual(await database.list(), []);

    const created = await database.create("Test packaging");
    assert.equal(created.title, "Test packaging");
    assert.equal(created.completed, false);
    assert.equal((await database.list()).length, 1);

    const updated = await database.update({ ...created, title: "Test CRUD", completed: true });
    assert.equal(updated.title, "Test CRUD");
    assert.equal(updated.completed, true);

    await database.delete(created.id);
    assert.deepEqual(await database.list(), []);
    await database.close();
    database = undefined;

    const header = fs.readFileSync(databasePath).subarray(0, 16).toString("utf8");
    assert.notEqual(header, "SQLite format 3\u0000");
    console.log("CRUD and SQLCipher encrypted-header smoke tests passed.");
  } finally {
    if (database) await database.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    app.quit();
  }
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
