import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export function createDatabase(databasePath) {
    if (databasePath !== ":memory:") {
        mkdirSync(dirname(databasePath), { recursive: true });
    }

    const database = new DatabaseSync(databasePath);
    database.exec(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            location TEXT NOT NULL DEFAULT '',
            bio TEXT NOT NULL DEFAULT '',
            goal TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin', 'superadmin')),
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            calories INTEGER NOT NULL,
            exercises TEXT NOT NULL DEFAULT '[]',
            started_at TEXT NOT NULL,
            completed_at TEXT,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS workouts_user_created
            ON workouts(user_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS measurements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            metric TEXT NOT NULL,
            value REAL NOT NULL,
            unit TEXT NOT NULL,
            recorded_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS measurements_user_recorded
            ON measurements(user_id, recorded_at DESC);

        CREATE TABLE IF NOT EXISTS user_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            challenge_key TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            target INTEGER NOT NULL,
            progress INTEGER NOT NULL DEFAULT 0,
            unit TEXT NOT NULL,
            reward TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(user_id, challenge_key)
        );

        CREATE TABLE IF NOT EXISTS user_settings (
            user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            notifications INTEGER NOT NULL DEFAULT 1,
            workout_reminders INTEGER NOT NULL DEFAULT 1,
            private_profile INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        );
    `);

    const userColumns = database.prepare("PRAGMA table_info(users)").all();
    if (!userColumns.some((column) => column.name === "role")) {
        database.exec(`
            ALTER TABLE users
            ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin', 'superadmin'))
        `);
    }

    return database;
}

export function createUser(database, user) {
    const challenges = [
        {
            key: "7-day-streak",
            title: "7 Day Streak",
            description: "Complete one workout every day for 7 consecutive days.",
            target: 7,
            unit: "days",
            reward: "150 XP",
        },
        {
            key: "10k-steps",
            title: "10K Steps",
            description: "Reach 10,000 steps in a single day.",
            target: 10000,
            unit: "steps",
            reward: "100 XP",
        },
        {
            key: "strength-builder",
            title: "Strength Builder",
            description: "Complete 12 strength workouts.",
            target: 12,
            unit: "workouts",
            reward: "250 XP",
        },
        {
            key: "monthly-warrior",
            title: "Monthly Warrior",
            description: "Complete 20 workouts this month.",
            target: 20,
            unit: "workouts",
            reward: "500 XP",
        },
    ];

    database.exec("BEGIN");

    try {
        database.prepare(`
            INSERT INTO users (id, name, email, password_hash, password_salt, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            user.id,
            user.name,
            user.email,
            user.passwordHash,
            user.passwordSalt,
            user.createdAt,
        );

        database.prepare(`
            INSERT INTO user_settings (user_id, updated_at)
            VALUES (?, ?)
        `).run(user.id, user.createdAt);

        const insertChallenge = database.prepare(`
            INSERT INTO user_challenges
                (user_id, challenge_key, title, description, target, unit, reward, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const challenge of challenges) {
            insertChallenge.run(
                user.id,
                challenge.key,
                challenge.title,
                challenge.description,
                challenge.target,
                challenge.unit,
                challenge.reward,
                user.createdAt,
            );
        }

        database.exec("COMMIT");
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
}

export function findUserByEmail(database, email) {
    return database.prepare(`
        SELECT id, name, email, password_hash AS passwordHash,
               password_salt AS passwordSalt, location, bio, goal, role,
               created_at AS createdAt
        FROM users
        WHERE email = ?
    `).get(email);
}

export function findUserById(database, id) {
    return database.prepare(`
        SELECT id, name, email, location, bio, goal, role, created_at AS createdAt
        FROM users
        WHERE id = ?
    `).get(id);
}
