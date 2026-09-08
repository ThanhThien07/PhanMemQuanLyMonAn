import sqlite3 from 'sqlite3';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbType = process.env.DB_TYPE || 'sqlite';
let sqliteDb = null;
let mysqlPool = null;

if (dbType === 'sqlite') {
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.resolve(__dirname, '../../', process.env.DB_SQLITE_PATH || './data/database.sqlite');
  
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Lỗi kết nối SQLite:', err.message);
    } else {
      console.log('✅ Đã kết nối SQLite Database:', dbPath);
    }
  });
} else {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'quan_ly_nha_hang',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ Đã khởi tạo MySQL Connection Pool');
}

/**
 * Thực thi câu truy vấn trả về danh sách nhiều dòng (SELECT ...)
 */
export async function query(sql, params = []) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  } else {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  }
}

/**
 * Thực thi câu truy vấn trả về 1 dòng duy nhất (SELECT ... LIMIT 1)
 */
export async function getOne(sql, params = []) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  } else {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  }
}

/**
 * Thực thi câu lệnh INSERT, UPDATE, DELETE (trả về lastID, changes)
 */
export async function execute(sql, params = []) {
  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({
          insertId: this.lastID,
          affectedRows: this.changes
        });
      });
    });
  } else {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }
}

export default {
  query,
  getOne,
  execute
};
