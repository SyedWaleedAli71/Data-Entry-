import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const envText = await readFile(path.join(root, ".env.local"), "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env.local first.");
  process.exitCode = 1;
} else if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must contain at least 12 characters.");
  process.exitCode = 1;
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ADMIN_EMAIL) || !ADMIN_NAME.trim()) {
  console.error("Set a valid ADMIN_EMAIL and non-empty ADMIN_NAME.");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = mongoose.connection.collection("users");
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error("An account with ADMIN_EMAIL already exists. Bootstrap only creates a new administrator.");
    }
    await users.insertOne({
      name: ADMIN_NAME.trim(),
      email,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
      role: "admin",
      accountStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`Administrator created for ${email}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unable to create administrator.");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
