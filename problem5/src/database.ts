import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

interface CountRow {
  count: number;
}

class DBModel {
  private db: sqlite3.Database;

  constructor(){
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Failed to connect to database:", err.message);
      } else {
        console.log("Connected to SQLite database.");
        this.initialize();
      }
    });
  }

  private initialize() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.run(createTableSQL);
  }

  public getItemByName(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM items WHERE name = ?`, [name], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  public insertItem(name: string, description: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO items (name, description) VALUES (?, ?)`;
      this.db.run(sql, [name, description], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Method to get all items
  public getAllItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM items`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Method to filter items by name or description
  public async getFilteredItems(name: string, description: string, limit: number, offset: number): Promise<{ items: any[]; total: number }> {
    return new Promise((resolve, reject) => {
      const conditions: string[] = ["1=1"]; // Default condition to avoid empty WHERE clause
      const params: any[] = [];

      if (name) {
        conditions.push(`name LIKE ?`);
        params.push(`%${name}%`);
      }
      if (description) {
        conditions.push(`description LIKE ?`);
        params.push(`%${description}%`);
      }

      const sql = `SELECT * FROM items WHERE ${conditions.join(" AND ")} LIMIT ? OFFSET ?`;
      params.push(limit, offset); // Add pagination parameters

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
  
        // Get total count of items matching the filter
        const countSql = `SELECT COUNT(*) AS count FROM items WHERE ${conditions.join(" AND ")}`;
        this.db.get(countSql, params.slice(0, params.length - 2), (err, countRow: CountRow | undefined) => {
          if (err) reject(err);
          if (countRow && countRow.count !== undefined) {
            resolve({ items: rows, total: countRow.count });
          } else {
            reject(new Error("Failed to retrieve count"));
          }
        });
      });
    });
  }

  public getItemById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  public updateItem(id: number, name: string, description: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE items SET name = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      this.db.run(sql, [name, description, id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public deleteItem(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM items WHERE id = ?`;
      this.db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

}

export default new DBModel();