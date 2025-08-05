import express from 'express';
import {handlerReadiness} from './api/readiness.js';
import {handlerHits, handlerResetHits} from './api/hits.js';
import {errorMiddleware, middlewareLogResponses, middlewareMetricsInc} from './middleware.js';
import {validateChirp} from "./api/validate_chirp.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static('./src/app'));
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerHits);
app.post("/admin/reset", handlerResetHits);
app.post("/api/validate_chirp", validateChirp);
app.use(errorMiddleware);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});