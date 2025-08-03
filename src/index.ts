import express from 'express';
import {handlerReadiness} from './api/readiness.js';
import {handlerHits, handlerResetHits} from './api/hits.js';
import {middlewareLogResponses, middlewareMetricsInc} from './middleware.js';

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static('./src/app'));
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerHits);
app.get("/reset", handlerResetHits);

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});