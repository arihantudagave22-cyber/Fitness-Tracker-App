import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDatabase } from "./database.js";
import { createApiServer } from "./server.js";

const defaultDatabasePath = fileURLToPath(new URL("../data/fitness.sqlite", import.meta.url));
const database = createDatabase(process.env.DATABASE_PATH ?? defaultDatabasePath);
const frontendDirectory = fileURLToPath(new URL("../../dist", import.meta.url));
let tokenSecret = process.env.AUTH_TOKEN_SECRET;

if (!tokenSecret) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_TOKEN_SECRET must be set in production.");
    }
    tokenSecret = process.env.DEV_AUTH_TOKEN_SECRET;
    if (!tokenSecret) {
        tokenSecret = randomBytes(32).toString("hex");
        console.warn("AUTH_TOKEN_SECRET is unset; using a temporary development secret.");
    }
}

const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];
const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
}

const server = createApiServer({
    database,
    tokenSecret,
    allowedOrigins,
    staticDirectory: existsSync(frontendDirectory) ? frontendDirectory : null,
});
server.listen(port, "0.0.0.0", () => {
    console.log(`FitTrack API listening on http://localhost:${port}`);
    if (!existsSync(frontendDirectory)) {
        console.log("Frontend build not found. Run npm run build to enable production frontend hosting.");
    }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
        server.close(() => {
            database.close();
            process.exit(0);
        });
    });
}
