import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDatabase } from "../src/database.js";

const email = process.argv[2]?.trim().toLowerCase();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultDatabasePath = fileURLToPath(new URL("../data/fitness.sqlite", import.meta.url));
const databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath;

if (!emailPattern.test(email ?? "")) {
    console.error("Usage: npm run promote-superadmin -- <registered-email>");
    process.exitCode = 1;
} else if (!existsSync(databasePath)) {
    console.error("The application database does not exist. Register the account before promoting it.");
    process.exitCode = 1;
} else {
    const database = createDatabase(databasePath);
    try {
        const account = database.prepare(`
            SELECT id, name, email FROM users WHERE email = ? COLLATE NOCASE
        `).get(email);
        if (!account) {
            console.error(`No registered account found for ${email}. Register it first, then retry.`);
            process.exitCode = 1;
        } else {
            database.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?").run(account.id);
            console.log(`Granted superadmin to ${account.name} (${account.email}).`);
        }
    } finally {
        database.close();
    }
}
