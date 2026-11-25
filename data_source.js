const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

// Gọi 1 lần lúc khởi động server, trước khi listen
async function connect() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) throw new Error('MONGODB_URI is not set in the .env file');
  if (!dbName) throw new Error('MONGODB_DB is not set in the .env file');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  return db;
}

// Dùng trong repository: lấy handle đã kết nối
function getDb() {
  if (!db) throw new Error('Database is not connected. Call connect() first.');
  return db;
}

async function close() {
  if (client) await client.close();
  client = null;
  db = null;
}

module.exports = { connect, getDb, close };
