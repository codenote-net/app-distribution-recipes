const sqlite3 = require("@journeyapps/sqlcipher").verbose();

class TodoDatabase {
  constructor(filePath, encryptionKey) {
    this.database = new sqlite3.Database(filePath);
    this.encryptionKey = encryptionKey;
  }

  static async open(filePath, encryptionKey) {
    const instance = new TodoDatabase(filePath, encryptionKey);
    await instance.initialize();
    return instance;
  }

  async initialize() {
    const escapedKey = this.encryptionKey.replaceAll("'", "''");
    await this.run("PRAGMA cipher_compatibility = 4");
    await this.run(`PRAGMA key = '${escapedKey}'`);
    await this.run("PRAGMA journal_mode = WAL");
    await this.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async list() {
    return (await this.all(`
      SELECT id, title, completed, created_at AS createdAt, updated_at AS updatedAt
      FROM todos ORDER BY completed ASC, id DESC
    `)).map(normalizeTodo);
  }

  async create(title) {
    const result = await this.run("INSERT INTO todos (title) VALUES (?)", [validateTitle(title)]);
    return normalizeTodo(await this.getTodo(result.lastID));
  }

  async update(todo) {
    const id = validateId(todo?.id);
    const result = await this.run(`
      UPDATE todos SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `, [validateTitle(todo?.title), todo?.completed === true ? 1 : 0, id]);
    if (result.changes === 0) throw new Error("Todo not found.");
    return normalizeTodo(await this.getTodo(id));
  }

  async delete(id) {
    const result = await this.run("DELETE FROM todos WHERE id = ?", [validateId(id)]);
    if (result.changes === 0) throw new Error("Todo not found.");
  }

  getTodo(id) {
    return this.get(`
      SELECT id, title, completed, created_at AS createdAt, updated_at AS updatedAt
      FROM todos WHERE id = ?
    `, [id]);
  }

  run(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.database.run(sql, parameters, function onRun(error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.database.get(sql, parameters, (error, row) => error ? reject(error) : resolve(row));
    });
  }

  all(sql, parameters = []) {
    return new Promise((resolve, reject) => {
      this.database.all(sql, parameters, (error, rows) => error ? reject(error) : resolve(rows));
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.database.close((error) => error ? reject(error) : resolve());
    });
  }
}

function validateTitle(title) {
  if (typeof title !== "string") throw new TypeError("Title must be a string.");
  const cleanTitle = title.trim();
  if (cleanTitle.length === 0 || cleanTitle.length > 200) {
    throw new RangeError("Title must contain between 1 and 200 characters.");
  }
  return cleanTitle;
}

function validateId(id) {
  if (!Number.isSafeInteger(id) || id < 1) throw new TypeError("Todo ID must be a positive integer.");
  return id;
}

function normalizeTodo(todo) {
  return { ...todo, completed: todo.completed === 1 };
}

module.exports = TodoDatabase;
