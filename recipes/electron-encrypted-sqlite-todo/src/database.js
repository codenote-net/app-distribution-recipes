const Database = require("better-sqlite3-multiple-ciphers");

class TodoDatabase {
  constructor(filePath, encryptionKey) {
    this.database = new Database(filePath);
    this.database.key(Buffer.from(encryptionKey, "utf8"));
    this.database.pragma("journal_mode = WAL");
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.listStatement = this.database.prepare(`
      SELECT id, title, completed, created_at AS createdAt, updated_at AS updatedAt
      FROM todos
      ORDER BY completed ASC, id DESC
    `);
    this.getStatement = this.database.prepare(`
      SELECT id, title, completed, created_at AS createdAt, updated_at AS updatedAt
      FROM todos
      WHERE id = ?
    `);
    this.createStatement = this.database.prepare("INSERT INTO todos (title) VALUES (?)");
    this.updateStatement = this.database.prepare(`
      UPDATE todos
      SET title = @title, completed = @completed, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    this.deleteStatement = this.database.prepare("DELETE FROM todos WHERE id = ?");
  }

  list() {
    return this.listStatement.all().map(normalizeTodo);
  }

  create(title) {
    const cleanTitle = validateTitle(title);
    const result = this.createStatement.run(cleanTitle);
    return normalizeTodo(this.getStatement.get(result.lastInsertRowid));
  }

  update(todo) {
    const id = validateId(todo?.id);
    const title = validateTitle(todo?.title);
    const completed = todo?.completed === true ? 1 : 0;
    const result = this.updateStatement.run({ id, title, completed });

    if (result.changes === 0) {
      throw new Error("Todo not found.");
    }

    return normalizeTodo(this.getStatement.get(id));
  }

  delete(id) {
    const result = this.deleteStatement.run(validateId(id));
    if (result.changes === 0) {
      throw new Error("Todo not found.");
    }
  }

  close() {
    if (this.database.open) {
      this.database.close();
    }
  }
}

function validateTitle(title) {
  if (typeof title !== "string") {
    throw new TypeError("Title must be a string.");
  }

  const cleanTitle = title.trim();
  if (cleanTitle.length === 0 || cleanTitle.length > 200) {
    throw new RangeError("Title must contain between 1 and 200 characters.");
  }
  return cleanTitle;
}

function validateId(id) {
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new TypeError("Todo ID must be a positive integer.");
  }
  return id;
}

function normalizeTodo(todo) {
  return { ...todo, completed: todo.completed === 1 };
}

module.exports = TodoDatabase;
