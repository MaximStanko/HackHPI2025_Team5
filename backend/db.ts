// db/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');
  }
  return db;
}

export async function initializeDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER
    );
  `);
}

export async function addItem(name: string, quantity: number) {
  return db.runAsync('INSERT INTO items (name, quantity) VALUES (?, ?)', [name, quantity]);
}

export async function getItems() {
  return db.getAllAsync('SELECT * FROM items');
}

export async function updateItem(id: number, quantity: number) {
  return db.runAsync('UPDATE items SET quantity = ? WHERE id = ?', [quantity, id]);
}

export async function deleteItem(id: number) {
  return db.runAsync('DELETE FROM items WHERE id = ?', [id]);
}
