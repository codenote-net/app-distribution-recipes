const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app } = require("electron");
const TodoDatabase = require("../src/database");

app.whenReady().then(() => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "encrypted-todo-test-"));
  const databasePath = path.join(temporaryDirectory, "todos.db");
  const database = new TodoDatabase(databasePath, "smoke-test-key");

  try {
    assert.deepEqual(database.list(), []);

    const created = database.create("Test packaging");
    assert.equal(created.title, "Test packaging");
    assert.equal(created.completed, false);
    assert.equal(database.list().length, 1);

    const updated = database.update({ ...created, title: "Test CRUD", completed: true });
    assert.equal(updated.title, "Test CRUD");
    assert.equal(updated.completed, true);

    database.delete(created.id);
    assert.deepEqual(database.list(), []);
    database.close();

    const header = fs.readFileSync(databasePath).subarray(0, 16).toString("utf8");
    assert.notEqual(header, "SQLite format 3\u0000");
    console.log("CRUD and encrypted-header smoke tests passed.");
  } finally {
    database.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    app.quit();
  }
}).catch((error) => {
  console.error(error);
  app.exit(1);
});
