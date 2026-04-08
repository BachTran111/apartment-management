// src/utils/fileDb.js
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data/seed.json");

async function ensureFile() {
  try {
    await fs.access(filePath);
  } catch (err) {
    // Nếu file chưa có, tạo bằng cấu trúc rỗng
    const empty = { users: [], products: [], slots: [], transactions: [] };
    await fs.writeFile(filePath, JSON.stringify(empty, null, 2), "utf8");
  }
}

export async function readData() {
  await ensureFile();
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function writeData(data) {
  // ghi đè, pretty print
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function getNextId(collectionName) {
  const data = await readData();
  const arr = data[collectionName] || [];
  if (!arr.length) return 1;
  return Math.max(...arr.map((x) => x.id || 0)) + 1;
}
