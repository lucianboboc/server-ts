import express from 'express';
import {handlerReadiness} from './api/readiness.js';
import {handlerHits, handlerResetHits} from './api/hits.js';
import {errorMiddleware, middlewareLogResponses, middlewareMetricsInc} from './middleware.js';
import {validateChirp} from "./api/validate_chirp.js";
import {migrate} from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import {config} from "./config.js";
import {drizzle} from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static('./src/app'));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerHits);
app.post("/admin/reset", handlerResetHits);
app.post("/api/validate_chirp", validateChirp);
app.use(errorMiddleware);

const PORT = config.api.port;
app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});