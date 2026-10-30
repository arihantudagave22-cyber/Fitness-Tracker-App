import {
    createHmac,
    randomBytes,
    randomUUID,
    scrypt as callbackScrypt,
    timingSafeEqual,
} from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { createServer } from "node:http";
import {
    createUser,
    findUserByEmail,
    findUserById,
} from "./database.js";

const scrypt = promisify(callbackScrypt);
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const MAX_BODY_BYTES = 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFILE_FIELDS = ["name", "location", "bio", "goal"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
const SETTING_FIELDS = {
    notifications: "notifications",
    workoutReminders: "workout_reminders",
    privateProfile: "private_profile",
};
const MIME_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function json(response, status, value) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
    });
    response.end(JSON.stringify(value));
}

async function readJson(request) {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
            throw new HttpError(413, "Request body is too large.");
        }
        chunks.push(chunk);
    }

    if (size === 0) {
        return {};
    }

    if (!String(request.headers["content-type"] ?? "").includes("application/json")) {
        throw new HttpError(415, "Content-Type must be application/json.");
    }

    try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!body || Array.isArray(body) || typeof body !== "object") {
            throw new Error("Expected a JSON object.");
        }
        return body;
    } catch {
        throw new HttpError(400, "Request body must be valid JSON.");
    }
}

function requiredString(value, label, maximumLength) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > maximumLength) {
        throw new HttpError(400, `${label} is required and must be at most ${maximumLength} characters.`);
    }
    return value.trim();
}

function profileValue(field, value) {
    if (typeof value !== "string") {
        throw new HttpError(400, `${field} must be a string.`);
    }

    const trimmedValue = value.trim();
    const maximumLength = field === "Bio" ? 500 : 120;
    if (trimmedValue.length > maximumLength || (field === "Name" && !trimmedValue)) {
        throw new HttpError(400, `${field} ${field === "Name" ? "is required and " : ""}must be at most ${maximumLength} characters.`);
    }
    return trimmedValue;
}

function nonNegativeInteger(value, label) {
    if (!Number.isInteger(value) || value < 0 || value > 1000000) {
        throw new HttpError(400, `${label} must be a non-negative integer.`);
    }
    return value;
}

function isoDate(value, label, fallback = new Date().toISOString()) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value) || !Number.isFinite(Date.parse(value))) {
        throw new HttpError(400, `${label} must be a valid ISO date.`);
    }
    return new Date(value).toISOString();
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        bio: user.bio,
        goal: user.goal,
        createdAt: user.createdAt,
    };
}

function requireRole(user, roles) {
    if (!roles.includes(user.role)) {
        throw new HttpError(403, "You do not have permission to perform this action.");
    }
}

function signToken(userId, secret) {
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    })).toString("base64url");
    const signature = createHmac("sha256", secret).update(payload).digest("base64url");
    return `${payload}.${signature}`;
}

function verifyToken(token, secret) {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) {
        throw new HttpError(401, "Please sign in to continue.");
    }

    const expected = createHmac("sha256", secret).update(payload).digest();
    let actual;
    try {
        actual = Buffer.from(signature, "base64url");
    } catch {
        throw new HttpError(401, "Please sign in to continue.");
    }

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        throw new HttpError(401, "Please sign in to continue.");
    }

    try {
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (typeof claims.sub !== "string" || claims.exp <= Math.floor(Date.now() / 1000)) {
            throw new Error("Expired token.");
        }
        return claims.sub;
    } catch {
        throw new HttpError(401, "Please sign in to continue.");
    }
}

function configureCors(request, response, allowedOrigins) {
    const origin = request.headers.origin;
    response.setHeader("Vary", "Origin");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");

    if (!origin) {
        return;
    }
    let isSameOrigin = false;
    try {
        const forwardedProtocol = String(request.headers["x-forwarded-proto"] ?? "")
            .split(",")[0]
            .trim();
        const protocol = forwardedProtocol || (request.socket.encrypted ? "https" : "http");
        const host = request.headers.host;
        if (host) {
            isSameOrigin = new URL(`${protocol}://${host}`).origin === new URL(origin).origin;
        }
    } catch {
        isSameOrigin = false;
    }

    if (!allowedOrigins.has(origin) && !isSameOrigin) {
        throw new HttpError(403, "This origin is not allowed.");
    }

    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
}

function workoutRow(row) {
    return {
        id: row.id,
        title: row.title,
        durationMinutes: row.duration_minutes,
        calories: row.calories,
        exercises: JSON.parse(row.exercises),
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
    };
}

function measurementRow(row) {
    return {
        id: row.id,
        metric: row.metric,
        value: row.value,
        unit: row.unit,
        recordedAt: row.recorded_at,
        createdAt: row.created_at,
    };
}

function challengeRow(row) {
    return {
        key: row.challenge_key,
        title: row.title,
        description: row.description,
        target: row.target,
        progress: row.progress,
        unit: row.unit,
        reward: row.reward,
        status: row.progress >= row.target ? "completed" : "active",
        updatedAt: row.updated_at,
    };
}

function settingsRow(row) {
    return {
        notifications: Boolean(row.notifications),
        workoutReminders: Boolean(row.workout_reminders),
        privateProfile: Boolean(row.private_profile),
    };
}

function getFitnessSummary(database, userId) {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const weekStart = monday.toISOString();

    const totals = database.prepare(`
        SELECT COUNT(*) AS workout_count,
               COALESCE(SUM(calories), 0) AS calories,
               COALESCE(SUM(duration_minutes), 0) AS duration_minutes,
               COALESCE(SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END), 0) AS weekly_workouts,
               COALESCE(SUM(CASE WHEN substr(created_at, 1, 10) = ? THEN calories ELSE 0 END), 0) AS today_calories
        FROM workouts
        WHERE user_id = ?
    `).get(weekStart, today, userId);

    const dates = database.prepare(`
        SELECT DISTINCT substr(created_at, 1, 10) AS workout_date
        FROM workouts
        WHERE user_id = ? AND created_at >= ?
        ORDER BY workout_date DESC
    `).all(userId, new Date(Date.now() - 90 * 86400000).toISOString())
        .map((row) => row.workout_date);
    let streak = 0;
    let expectedDate = today;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dates[0] !== today) {
        expectedDate = yesterday;
    }
    for (const date of dates) {
        if (date !== expectedDate) {
            break;
        }
        streak += 1;
        const previous = new Date(`${expectedDate}T00:00:00.000Z`);
        previous.setUTCDate(previous.getUTCDate() - 1);
        expectedDate = previous.toISOString().slice(0, 10);
    }

    const weight = database.prepare(`
        SELECT value, unit FROM measurements
        WHERE user_id = ? AND lower(metric) IN ('weight', 'body weight')
        ORDER BY recorded_at DESC, id DESC
        LIMIT 1
    `).get(userId);
    const challenges = database.prepare(`
        SELECT COUNT(*) AS total,
               COALESCE(SUM(CASE WHEN progress >= target THEN 1 ELSE 0 END), 0) AS completed,
               COALESCE(SUM(CASE WHEN progress < target THEN 1 ELSE 0 END), 0) AS active
        FROM user_challenges WHERE user_id = ?
    `).get(userId);
    const recent = database.prepare(`
        SELECT id, title, duration_minutes, calories, exercises,
               started_at, completed_at, created_at
        FROM workouts WHERE user_id = ?
        ORDER BY created_at DESC LIMIT 5
    `).all(userId);

    return {
        totals: {
            workoutCount: totals.workout_count,
            calories: totals.calories,
            durationMinutes: totals.duration_minutes,
            weeklyWorkouts: totals.weekly_workouts,
            todayCalories: totals.today_calories,
        },
        streak,
        weight: weight ? { value: weight.value, unit: weight.unit } : null,
        challenges,
        recentWorkouts: recent.map(workoutRow),
    };
}

function getProgressData(database, userId, period) {
    const now = new Date();
    const rangeDays = period === "month" ? 28 : 7;
    const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    rangeStart.setUTCDate(rangeStart.getUTCDate() - rangeDays + 1);
    const startIso = rangeStart.toISOString();
    const rows = database.prepare(`
        SELECT substr(created_at, 1, 10) AS workout_date,
               COUNT(*) AS workouts,
               COALESCE(SUM(calories), 0) AS calories
        FROM workouts
        WHERE user_id = ? AND created_at >= ?
        GROUP BY workout_date
    `).all(userId, startIso);
    const daily = new Map(rows.map((row) => [row.workout_date, row]));
    const chart = [];

    if (period === "week") {
        for (let offset = 0; offset < 7; offset += 1) {
            const date = new Date(rangeStart);
            date.setUTCDate(date.getUTCDate() + offset);
            const key = date.toISOString().slice(0, 10);
            chart.push({
                day: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
                workouts: daily.get(key)?.workouts ?? 0,
                calories: daily.get(key)?.calories ?? 0,
            });
        }
    } else {
        for (let week = 0; week < 4; week += 1) {
            const start = new Date(rangeStart);
            start.setUTCDate(start.getUTCDate() + week * 7);
            const end = new Date(start);
            end.setUTCDate(end.getUTCDate() + 7);
            const values = rows.filter((row) => {
                const timestamp = Date.parse(`${row.workout_date}T00:00:00.000Z`);
                return timestamp >= start.getTime() && timestamp < end.getTime();
            });
            chart.push({
                day: `Week ${week + 1}`,
                workouts: values.reduce((sum, row) => sum + row.workouts, 0),
                calories: values.reduce((sum, row) => sum + row.calories, 0),
            });
        }
    }

    const totals = database.prepare(`
        SELECT COUNT(*) AS workouts,
               COALESCE(SUM(calories), 0) AS calories,
               COALESCE(SUM(duration_minutes), 0) AS duration_minutes
        FROM workouts WHERE user_id = ? AND created_at >= ?
    `).get(userId, startIso);
    const achievements = database.prepare(`
        SELECT COUNT(*) AS completed
        FROM user_challenges WHERE user_id = ? AND progress >= target
    `).get(userId);

    return {
        period,
        chart,
        totals: {
            workouts: totals.workouts,
            calories: totals.calories,
            durationMinutes: totals.duration_minutes,
            completedChallenges: achievements.completed,
        },
    };
}

async function serveFrontend(request, response, staticDirectory) {
    if (!staticDirectory) {
        return false;
    }

    let pathname;
    try {
        pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
        throw new HttpError(400, "Invalid URL.");
    }

    const safePath = resolve(staticDirectory, `.${pathname}`);
    const rootPath = resolve(staticDirectory);
    if (safePath !== rootPath && !safePath.startsWith(`${rootPath}${sep}`)) {
        throw new HttpError(400, "Invalid path.");
    }

    let filePath = safePath;
    try {
        const info = await stat(filePath);
        if (info.isDirectory()) {
            filePath = resolve(filePath, "index.html");
        }
        await stat(filePath);
    } catch {
        if (extname(pathname)) {
            return false;
        }
        filePath = resolve(rootPath, "index.html");
    }

    const content = await readFile(filePath);
    const isHtml = extname(filePath) === ".html";
    response.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
        "Cache-Control": isHtml ? "no-cache" : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
    });
    response.end(content);
    return true;
}

export function createApiServer({ database, tokenSecret, allowedOrigins = [], staticDirectory = null }) {
    if (!database || !tokenSecret) {
        throw new Error("A database and token secret are required.");
    }

    const origins = new Set([
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        ...allowedOrigins,
    ]);

    return createServer(async (request, response) => {
        try {
            configureCors(request, response, origins);
            if (request.method === "OPTIONS") {
                response.writeHead(204);
                response.end();
                return;
            }

            const url = new URL(request.url, "http://localhost");
            const path = url.pathname;
            const method = request.method;

            if (method === "GET" && path === "/api/health") {
                json(response, 200, { status: "ok" });
                return;
            }

            if (method === "POST" && path === "/api/auth/register") {
                const body = await readJson(request);
                const name = requiredString(body.name, "Name", 80);
                const email = requiredString(body.email, "Email", 254).toLowerCase();
                const password = body.password;

                if (!EMAIL_PATTERN.test(email)) {
                    throw new HttpError(400, "Enter a valid email address.");
                }
                if (typeof password !== "string" || password.length < 8 || password.length > 128) {
                    throw new HttpError(400, "Password must be between 8 and 128 characters.");
                }
                if (findUserByEmail(database, email)) {
                    throw new HttpError(409, "An account with this email already exists.");
                }

                const salt = randomBytes(16).toString("hex");
                const passwordHash = await scrypt(password, salt, 64);
                const user = {
                    id: randomUUID(),
                    name,
                    email,
                    passwordHash: passwordHash.toString("hex"),
                    passwordSalt: salt,
                    createdAt: new Date().toISOString(),
                };

                try {
                    createUser(database, user);
                } catch (error) {
                    if (String(error.message).includes("users.email")) {
                        throw new HttpError(409, "An account with this email already exists.");
                    }
                    throw error;
                }

                json(response, 201, {
                    user: publicUser(findUserById(database, user.id)),
                    token: signToken(user.id, tokenSecret),
                });
                return;
            }

            if (method === "POST" && path === "/api/auth/login") {
                const body = await readJson(request);
                const email = requiredString(body.email, "Email", 254).toLowerCase();
                const password = body.password;

                if (typeof password !== "string" || !password || password.length > 128) {
                    throw new HttpError(400, "Email and password are required.");
                }

                const user = findUserByEmail(database, email);
                if (!user) {
                    throw new HttpError(401, "Invalid email or password.");
                }

                const candidate = await scrypt(password, user.passwordSalt, 64);
                const stored = Buffer.from(user.passwordHash, "hex");
                if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
                    throw new HttpError(401, "Invalid email or password.");
                }

                json(response, 200, {
                    user: publicUser(user),
                    token: signToken(user.id, tokenSecret),
                });
                return;
            }

            if (method !== "GET" && method !== "POST" && method !== "PATCH" && method !== "DELETE") {
                throw new HttpError(405, "Method not allowed.");
            }

            if (!path.startsWith("/api/")) {
                if (method === "GET" && await serveFrontend(request, response, staticDirectory)) {
                    return;
                }
                throw new HttpError(404, "Route not found.");
            }

            const authorization = request.headers.authorization ?? "";
            const match = /^Bearer ([^\s]+)$/.exec(authorization);
            if (!match) {
                throw new HttpError(401, "Please sign in to continue.");
            }
            const userId = verifyToken(match[1], tokenSecret);
            const user = findUserById(database, userId);
            if (!user) {
                throw new HttpError(401, "Please sign in to continue.");
            }

            if (method === "GET" && path === "/api/admin/users") {
                requireRole(user, ["admin", "superadmin"]);
                const users = database.prepare(`
                    SELECT id, name, email, role, created_at AS createdAt
                    FROM users ORDER BY created_at DESC
                `).all();
                json(response, 200, { users });
                return;
            }

            const roleUpdateMatch = /^\/api\/admin\/users\/([^/]+)\/role$/.exec(path);
            if (method === "PATCH" && roleUpdateMatch) {
                requireRole(user, ["superadmin"]);
                const body = await readJson(request);
                const allowedRoles = ["user", "admin", "superadmin"];
                if (!allowedRoles.includes(body.role)) {
                    throw new HttpError(400, "Role must be user, admin, or superadmin.");
                }

                const target = database.prepare(`
                    SELECT id, role FROM users WHERE id = ?
                `).get(roleUpdateMatch[1]);
                if (!target) {
                    throw new HttpError(404, "User not found.");
                }
                if (target.role === "superadmin" && body.role !== "superadmin") {
                    const count = database.prepare(`
                        SELECT COUNT(*) AS count FROM users WHERE role = 'superadmin'
                    `).get().count;
                    if (count <= 1) {
                        throw new HttpError(409, "At least one superadmin account must remain.");
                    }
                }

                database.prepare("UPDATE users SET role = ? WHERE id = ?")
                    .run(body.role, target.id);
                json(response, 200, { user: publicUser(findUserById(database, target.id)) });
                return;
            }

            if (method === "GET" && path === "/api/dashboard") {
                json(response, 200, { dashboard: getFitnessSummary(database, userId) });
                return;
            }

            if (method === "GET" && path === "/api/progress") {
                const period = url.searchParams.get("period") ?? "week";
                if (period !== "week" && period !== "month") {
                    throw new HttpError(400, "Period must be week or month.");
                }
                json(response, 200, { progress: getProgressData(database, userId, period) });
                return;
            }

            if (method === "GET" && path === "/api/settings") {
                database.prepare(`
                    INSERT OR IGNORE INTO user_settings (user_id, updated_at)
                    VALUES (?, ?)
                `).run(userId, new Date().toISOString());
                const row = database.prepare(`
                    SELECT notifications, workout_reminders, private_profile
                    FROM user_settings WHERE user_id = ?
                `).get(userId);
                json(response, 200, { settings: settingsRow(row) });
                return;
            }

            if (method === "PATCH" && path === "/api/settings") {
                const body = await readJson(request);
                const fields = Object.keys(body);
                if (fields.length === 0 || fields.some((field) => !Object.hasOwn(SETTING_FIELDS, field))) {
                    throw new HttpError(400, "Provide one or more valid settings to update.");
                }
                for (const field of fields) {
                    if (typeof body[field] !== "boolean") {
                        throw new HttpError(400, `${field} must be a boolean.`);
                    }
                }
                database.prepare(`
                    INSERT OR IGNORE INTO user_settings (user_id, updated_at)
                    VALUES (?, ?)
                `).run(userId, new Date().toISOString());
                database.prepare(`
                    UPDATE user_settings
                    SET ${fields.map((field) => `${SETTING_FIELDS[field]} = ?`).join(", ")},
                        updated_at = ?
                    WHERE user_id = ?
                `).run(...fields.map((field) => Number(body[field])), new Date().toISOString(), userId);
                const row = database.prepare(`
                    SELECT notifications, workout_reminders, private_profile
                    FROM user_settings WHERE user_id = ?
                `).get(userId);
                json(response, 200, { settings: settingsRow(row) });
                return;
            }

            if (method === "POST" && path === "/api/auth/change-password") {
                const body = await readJson(request);
                const currentPassword = body.currentPassword;
                const newPassword = body.newPassword;
                if (typeof currentPassword !== "string" || !currentPassword ||
                    typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
                    throw new HttpError(400, "Provide your current password and a new password of 8 to 128 characters.");
                }
                const account = findUserByEmail(database, user.email);
                const currentHash = await scrypt(currentPassword, account.passwordSalt, 64);
                const storedHash = Buffer.from(account.passwordHash, "hex");
                if (!timingSafeEqual(currentHash, storedHash)) {
                    throw new HttpError(401, "Current password is incorrect.");
                }
                const salt = randomBytes(16).toString("hex");
                const passwordHash = await scrypt(newPassword, salt, 64);
                database.prepare(`
                    UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?
                `).run(passwordHash.toString("hex"), salt, userId);
                json(response, 200, { message: "Password updated." });
                return;
            }

            if (method === "GET" && (path === "/api/auth/me" || path === "/api/profile")) {
                json(response, 200, { user: publicUser(user) });
                return;
            }

            if (method === "PATCH" && path === "/api/profile") {
                const body = await readJson(request);
                const updates = PROFILE_FIELDS.filter((field) => Object.hasOwn(body, field));
                if (updates.length === 0) {
                    throw new HttpError(400, "Provide at least one profile field to update.");
                }
                const values = updates.map((field) =>
                    profileValue(field[0].toUpperCase() + field.slice(1), body[field])
                );
                database.prepare(`
                    UPDATE users
                    SET ${updates.map((field) => `${field} = ?`).join(", ")}
                    WHERE id = ?
                `).run(...values, userId);
                json(response, 200, { user: publicUser(findUserById(database, userId)) });
                return;
            }

            if (method === "GET" && path === "/api/workouts") {
                const rows = database.prepare(`
                    SELECT id, title, duration_minutes, calories, exercises,
                           started_at, completed_at, created_at
                    FROM workouts
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    LIMIT 100
                `).all(userId);
                json(response, 200, { workouts: rows.map(workoutRow) });
                return;
            }

            if (method === "POST" && path === "/api/workouts") {
                const body = await readJson(request);
                const title = requiredString(body.title, "Workout title", 120);
                const duration = nonNegativeInteger(body.durationMinutes, "Duration");
                const calories = nonNegativeInteger(body.calories, "Calories");
                const exercises = body.exercises ?? [];
                if (!Array.isArray(exercises) || exercises.length > 50) {
                    throw new HttpError(400, "Exercises must be an array of at most 50 items.");
                }
                const now = new Date().toISOString();
                const startedAt = isoDate(body.startedAt, "Start date", now);
                const completedAt = body.completedAt === null
                    ? null
                    : isoDate(body.completedAt, "Completion date", now);
                const result = database.prepare(`
                    INSERT INTO workouts
                        (user_id, title, duration_minutes, calories, exercises, started_at, completed_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    userId,
                    title,
                    duration,
                    calories,
                    JSON.stringify(exercises),
                    startedAt,
                    completedAt,
                    now,
                );
                const row = database.prepare(`
                    SELECT id, title, duration_minutes, calories, exercises,
                           started_at, completed_at, created_at
                    FROM workouts WHERE id = ? AND user_id = ?
                `).get(Number(result.lastInsertRowid), userId);
                json(response, 201, { workout: workoutRow(row) });
                return;
            }

            if (method === "GET" && path === "/api/measurements") {
                const rows = database.prepare(`
                    SELECT id, metric, value, unit, recorded_at, created_at
                    FROM measurements
                    WHERE user_id = ?
                    ORDER BY recorded_at DESC
                    LIMIT 500
                `).all(userId);
                json(response, 200, { measurements: rows.map(measurementRow) });
                return;
            }

            if (method === "POST" && path === "/api/measurements") {
                const body = await readJson(request);
                const metric = requiredString(body.metric, "Measurement name", 80);
                const unit = requiredString(body.unit, "Unit", 20);
                if (typeof body.value !== "number" || !Number.isFinite(body.value) || body.value <= 0 || body.value > 100000) {
                    throw new HttpError(400, "Measurement value must be a positive number.");
                }
                const now = new Date().toISOString();
                const recordedAt = isoDate(body.recordedAt, "Measurement date", now);
                const result = database.prepare(`
                    INSERT INTO measurements (user_id, metric, value, unit, recorded_at, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(userId, metric, body.value, unit, recordedAt, now);
                const row = database.prepare(`
                    SELECT id, metric, value, unit, recorded_at, created_at
                    FROM measurements WHERE id = ? AND user_id = ?
                `).get(Number(result.lastInsertRowid), userId);
                json(response, 201, { measurement: measurementRow(row) });
                return;
            }

            if (method === "GET" && path === "/api/challenges") {
                const rows = database.prepare(`
                    SELECT challenge_key, title, description, target, progress, unit, reward, updated_at
                    FROM user_challenges
                    WHERE user_id = ?
                    ORDER BY id
                `).all(userId);
                json(response, 200, { challenges: rows.map(challengeRow) });
                return;
            }

            const progressMatch = /^\/api\/challenges\/([a-z0-9-]+)\/progress$/.exec(path);
            if (method === "POST" && progressMatch) {
                const result = database.prepare(`
                    UPDATE user_challenges
                    SET progress = MIN(progress + 1, target), updated_at = ?
                    WHERE user_id = ? AND challenge_key = ?
                `).run(new Date().toISOString(), userId, progressMatch[1]);
                if (result.changes === 0) {
                    throw new HttpError(404, "Challenge not found.");
                }
                const row = database.prepare(`
                    SELECT challenge_key, title, description, target, progress, unit, reward, updated_at
                    FROM user_challenges
                    WHERE user_id = ? AND challenge_key = ?
                `).get(userId, progressMatch[1]);
                json(response, 200, { challenge: challengeRow(row) });
                return;
            }

            if (await serveFrontend(request, response, staticDirectory)) {
                return;
            }

            throw new HttpError(404, "Route not found.");
        } catch (error) {
            if (response.headersSent) {
                response.destroy(error);
                return;
            }
            if (error instanceof HttpError) {
                json(response, error.status, { error: error.message });
                return;
            }
            console.error("API request failed:", error);
            json(response, 500, { error: "An unexpected server error occurred." });
        }
    });
}
