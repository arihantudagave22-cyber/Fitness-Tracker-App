import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";
import { createDatabase, createUser } from "../src/database.js";
import { createApiServer } from "../src/server.js";

let database;
let server;
let baseUrl;
let token;
let userId;

before(async () => {
    database = createDatabase(":memory:");
    server = createApiServer({ database, tokenSecret: "test-secret-that-is-long-enough" });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    database.close();
});

async function request(path, { method = "GET", body, rawBody, authToken = token, origin } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            ...(body === undefined && rawBody === undefined ? {} : { "Content-Type": "application/json" }),
            ...(origin ? { Origin: origin } : {}),
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        ...(body === undefined && rawBody === undefined
            ? {}
            : { body: rawBody ?? JSON.stringify(body) }),
    });
    const data = response.status === 204 ? null : await response.json();
    return { status: response.status, data, headers: response.headers };
}

test("supports health, registration, login, and authenticated fitness data", async () => {
    const health = await request("/api/health", { authToken: null });
    assert.equal(health.status, 200);
    assert.deepEqual(health.data, { status: "ok" });

    const registration = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Alex Morgan", email: "Alex@example.com", password: "secure-password" },
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.data.user.email, "alex@example.com");
    assert.equal(registration.data.user.role, "user");
    assert.equal("passwordHash" in registration.data.user, false);
    token = registration.data.token;
    userId = registration.data.user.id;

    const duplicate = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Another User", email: "alex@example.com", password: "secure-password" },
    });
    assert.equal(duplicate.status, 409);

    const login = await request("/api/auth/login", {
        method: "POST",
        authToken: null,
        body: { email: "ALEX@example.com", password: "secure-password" },
    });
    assert.equal(login.status, 200);
    assert.equal(login.data.user.id, userId);

    const unauthenticated = await request("/api/profile", { authToken: null });
    assert.equal(unauthenticated.status, 401);

    const profileUpdate = await request("/api/profile", {
        method: "PATCH",
        body: { location: "Bengaluru, India", goal: "Build strength" },
    });
    assert.equal(profileUpdate.status, 200);
    assert.equal(profileUpdate.data.user.location, "Bengaluru, India");

    const clearOptionalProfileFields = await request("/api/profile", {
        method: "PATCH",
        body: { location: "", bio: "  ", goal: "" },
    });
    assert.equal(clearOptionalProfileFields.status, 200);
    assert.equal(clearOptionalProfileFields.data.user.location, "");
    assert.equal(clearOptionalProfileFields.data.user.bio, "");
    assert.equal(clearOptionalProfileFields.data.user.goal, "");

    const blankName = await request("/api/profile", {
        method: "PATCH",
        body: { name: "  " },
    });
    assert.equal(blankName.status, 400);

    const workout = await request("/api/workouts", {
        method: "POST",
        body: {
            title: "Pull Day",
            durationMinutes: 65,
            calories: 480,
            exercises: [{ name: "Pullups", sets: 4, reps: 8 }],
        },
    });
    assert.equal(workout.status, 201);
    assert.equal(workout.data.workout.exercises[0].name, "Pullups");

    const workouts = await request("/api/workouts");
    assert.equal(workouts.data.workouts.length, 1);

    const measurement = await request("/api/measurements", {
        method: "POST",
        body: { metric: "Waist", value: 82.5, unit: "cm" },
    });
    assert.equal(measurement.status, 201);

    const weightMeasurement = await request("/api/measurements", {
        method: "POST",
        body: { metric: "Weight", value: 72.4, unit: "kg" },
    });
    assert.equal(weightMeasurement.status, 201);

    const measurements = await request("/api/measurements");
    assert.equal(
        measurements.data.measurements.find((entry) => entry.metric === "Waist").value,
        82.5,
    );

    const challenges = await request("/api/challenges");
    assert.equal(challenges.data.challenges.length, 4);
    const progress = await request("/api/challenges/7-day-streak/progress", { method: "POST" });
    assert.equal(progress.data.challenge.progress, 1);

    const dashboard = await request("/api/dashboard");
    assert.equal(dashboard.status, 200);
    assert.equal(dashboard.data.dashboard.totals.workoutCount, 1);
    assert.equal(dashboard.data.dashboard.weight.value, 72.4);
    assert.equal(dashboard.data.dashboard.recentWorkouts[0].title, "Pull Day");

    const weeklyProgress = await request("/api/progress?period=week");
    assert.equal(weeklyProgress.status, 200);
    assert.equal(weeklyProgress.data.progress.chart.length, 7);
    assert.equal(weeklyProgress.data.progress.totals.workouts, 1);

    const monthlyProgress = await request("/api/progress?period=month");
    assert.equal(monthlyProgress.data.progress.chart.length, 4);
    const invalidPeriod = await request("/api/progress?period=year");
    assert.equal(invalidPeriod.status, 400);

    const defaultSettings = await request("/api/settings");
    assert.equal(defaultSettings.data.settings.notifications, true);
    const updatedSettings = await request("/api/settings", {
        method: "PATCH",
        body: { notifications: false, privateProfile: true },
    });
    assert.equal(updatedSettings.data.settings.notifications, false);
    assert.equal(updatedSettings.data.settings.privateProfile, true);
    const invalidSettings = await request("/api/settings", {
        method: "PATCH",
        body: { unknownPreference: true },
    });
    assert.equal(invalidSettings.status, 400);

    const passwordUpdate = await request("/api/auth/change-password", {
        method: "POST",
        body: { currentPassword: "secure-password", newPassword: "updated-password" },
    });
    assert.equal(passwordUpdate.status, 200);
    const updatedPasswordLogin = await request("/api/auth/login", {
        method: "POST",
        authToken: null,
        body: { email: "alex@example.com", password: "updated-password" },
    });
    assert.equal(updatedPasswordLogin.status, 200);

    const invalidWorkout = await request("/api/workouts", {
        method: "POST",
        body: { title: "Invalid", durationMinutes: -1, calories: 10 },
    });

    assert.equal(invalidWorkout.status, 400);

    const invalidLogin = await request("/api/auth/login", {
        method: "POST",
        authToken: null,
        body: { email: "alex@example.com", password: "incorrect-password" },
    });
    assert.equal(invalidLogin.status, 401);
});

test("serves frontend files and client-side routes when configured", async () => {
    const staticDirectory = await mkdtemp(join(tmpdir(), "fittrack-static-"));
    const html = "<!doctype html><title>FitTrack test app</title>";
    await writeFile(join(staticDirectory, "index.html"), html);
    let staticServer;

    try {
        staticServer = createApiServer({
            database,
            tokenSecret: "test-secret-that-is-long-enough",
            staticDirectory,
        });
        await new Promise((resolve) => staticServer.listen(0, "127.0.0.1", resolve));
        const staticBaseUrl = `http://127.0.0.1:${staticServer.address().port}`;
        for (const route of ["/", "/settings"]) {
            const response = await fetch(`${staticBaseUrl}${route}`);
            assert.equal(response.status, 200);
            assert.equal(await response.text(), html);
        }
        const health = await fetch(`${staticBaseUrl}/api/health`);
        assert.deepEqual(await health.json(), { status: "ok" });
    } finally {
        if (staticServer) {
            await new Promise((resolve, reject) => {
                staticServer.close((error) => error ? reject(error) : resolve());
            });
        }
        await rm(staticDirectory, { recursive: true, force: true });
    }
});

test("does not accept an invalid bearer token", async () => {
    const response = await request("/api/profile", { authToken: "not-a-token" });
    assert.equal(response.status, 401);
});

test("keeps fitness records private to their owner", async () => {
    const secondUser = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Sam Lee", email: "sam@example.com", password: "another-password" },
    });
    assert.equal(secondUser.status, 201);

    const otherUsersWorkouts = await request("/api/workouts", {
        authToken: secondUser.data.token,
    });
    assert.deepEqual(otherUsersWorkouts.data.workouts, []);

    const otherUsersMeasurements = await request("/api/measurements", {
        authToken: secondUser.data.token,
    });
    assert.deepEqual(otherUsersMeasurements.data.measurements, []);

    const otherUsersSettings = await request("/api/settings", {
        authToken: secondUser.data.token,
    });
    assert.equal(otherUsersSettings.data.settings.notifications, true);
    assert.equal(otherUsersSettings.data.settings.privateProfile, false);
});

test("enforces role-based user management and protects the last superadmin", async () => {
    const superadmin = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Arihant", email: "arihant@superadmin.com", password: "admin-password" },
    });
    const target = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Taylor User", email: "taylor@example.com", password: "user-password" },
    });
    const secondTarget = await request("/api/auth/register", {
        method: "POST",
        authToken: null,
        body: { name: "Morgan User", email: "morgan@example.com", password: "user-password" },
    });
    database.prepare("UPDATE users SET role = 'superadmin' WHERE id = ?")
        .run(superadmin.data.user.id);

    const regularUserList = await request("/api/admin/users", {
        authToken: target.data.token,
    });
    assert.equal(regularUserList.status, 403);

    const unauthorizedPromotion = await request(`/api/admin/users/${target.data.user.id}/role`, {
        method: "PATCH",
        authToken: target.data.token,
        body: { role: "admin" },
    });
    assert.equal(unauthorizedPromotion.status, 403);

    const userList = await request("/api/admin/users", {
        authToken: superadmin.data.token,
    });
    assert.equal(userList.status, 200);
    assert.ok(userList.data.users.some((account) =>
        account.email === "arihant@superadmin.com" && account.role === "superadmin"
    ));

    const promotion = await request(`/api/admin/users/${target.data.user.id}/role`, {
        method: "PATCH",
        authToken: superadmin.data.token,
        body: { role: "admin" },
    });
    assert.equal(promotion.status, 200);
    assert.equal(promotion.data.user.role, "admin");

    const adminPromotionAttempt = await request(`/api/admin/users/${secondTarget.data.user.id}/role`, {
        method: "PATCH",
        authToken: target.data.token,
        body: { role: "superadmin" },
    });
    assert.equal(adminPromotionAttempt.status, 403);

    const secondPromotion = await request(`/api/admin/users/${secondTarget.data.user.id}/role`, {
        method: "PATCH",
        authToken: superadmin.data.token,
        body: { role: "superadmin" },
    });
    assert.equal(secondPromotion.status, 200);
    assert.equal(secondPromotion.data.user.role, "superadmin");

    const demotion = await request(`/api/admin/users/${superadmin.data.user.id}/role`, {
        method: "PATCH",
        authToken: superadmin.data.token,
        body: { role: "user" },
    });
    assert.equal(demotion.status, 200);
    assert.equal(demotion.data.user.role, "user");

    const finalSuperadminDemotion = await request(`/api/admin/users/${secondTarget.data.user.id}/role`, {
        method: "PATCH",
        authToken: secondTarget.data.token,
        body: { role: "admin" },
    });
    assert.equal(finalSuperadminDemotion.status, 409);

    const invalidRole = await request(`/api/admin/users/${target.data.user.id}/role`, {
        method: "PATCH",
        authToken: secondTarget.data.token,
        body: { role: "owner" },
    });
    assert.equal(invalidRole.status, 400);
});

test("migrates existing databases and promotes only a registered account", async () => {
    const directory = await mkdtemp(join(tmpdir(), "fittrack-role-"));
    const databasePath = join(directory, "fitness.sqlite");
    const legacy = new DatabaseSync(databasePath);
    legacy.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            location TEXT NOT NULL DEFAULT '',
            bio TEXT NOT NULL DEFAULT '',
            goal TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL
        )
    `);
    legacy.close();

    try {
        const migrated = createDatabase(databasePath);
        createUser(migrated, {
            id: "arihant-test-id",
            name: "Arihant",
            email: "arihant@superadmin.com",
            passwordHash: "test-hash",
            passwordSalt: "test-salt",
            createdAt: new Date().toISOString(),
        });
        assert.equal(
            migrated.prepare("SELECT role FROM users WHERE id = ?").get("arihant-test-id").role,
            "user",
        );
        migrated.close();

        const scriptPath = fileURLToPath(new URL("../scripts/promote-superadmin.js", import.meta.url));
        const missing = spawnSync(process.execPath, [scriptPath, "missing@example.com"], {
            encoding: "utf8",
            env: { ...process.env, DATABASE_PATH: databasePath },
        });
        assert.equal(missing.status, 1);
        assert.match(missing.stderr, /Register it first/);

        const promoted = execFileSync(process.execPath, [scriptPath, "ARIHANT@SUPERADMIN.COM"], {
            encoding: "utf8",
            env: { ...process.env, DATABASE_PATH: databasePath },
        });
        assert.match(promoted, /Granted superadmin to Arihant \(arihant@superadmin.com\)/);
        const verify = createDatabase(databasePath);
        assert.equal(
            verify.prepare("SELECT role FROM users WHERE id = ?").get("arihant-test-id").role,
            "superadmin",
        );
        verify.close();
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test("rejects malformed JSON and enforces the configured CORS policy", async () => {
    const sameOrigin = await request("/api/health", { authToken: null, origin: baseUrl });
    assert.equal(sameOrigin.status, 200);

    const malformedJson = await request("/api/auth/login", {
        method: "POST",
        authToken: null,
        rawBody: "{invalid",
    });
    assert.equal(malformedJson.status, 400);

    const preflight = await request("/api/profile", {
        method: "OPTIONS",
        authToken: null,
        origin: "http://localhost:5173",
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), "http://localhost:5173");

    const disallowedOrigin = await request("/api/health", {
        authToken: null,
        origin: "https://not-allowed.example",
    });
    assert.equal(disallowedOrigin.status, 403);
});
