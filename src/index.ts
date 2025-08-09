import express from 'express';
import {handlerReadiness} from './api/readiness.js';
import {handlerHits, handlerResetHits} from './api/hits.js';
import {errorMiddleware, middlewareLogResponses, middlewareMetricsInc} from './middleware.js';
import {migrate} from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {config} from "./config.js";
import {drizzle} from "drizzle-orm/postgres-js";
import {createUserHandler, updateUserHandler, loginUserHandler} from "./api/users.js";
import {createChirpHandler, getChirpsHandler, deleteChirpHandler, getChirpHandler} from "./api/chirps.js";
import {refreshTokenHandler, revokeRefreshTokenHandler} from "./api/tokens.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static('./src/app'));
app.get("/api/healthz", handlerReadiness);
app.post("/api/users", createUserHandler);
app.put("/api/users", updateUserHandler);
app.post("/api/login", loginUserHandler);
app.get("/admin/metrics", handlerHits);
app.post("/admin/reset", handlerResetHits);
app.get("/api/chirps/:chirpID", getChirpHandler);
app.delete("/api/chirps/:chirpID", deleteChirpHandler);
app.get("/api/chirps", getChirpsHandler);
app.post("/api/chirps", createChirpHandler);
app.post("/api/refresh", refreshTokenHandler);
app.post("/api/revoke", revokeRefreshTokenHandler);
app.use(errorMiddleware);

const PORT = config.api.port;
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});