import type { Request, Response, NextFunction } from 'express';
import {config} from './config.js';
import {respondWithJSON} from "./api/json.js";
import { HttpError }from './api/errors.js';

export const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
	res.on("finish", async () => {
		if (res.statusCode !== 200) {
			console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
		}
	});
	next();
};

export const middlewareMetricsInc = (req: Request, res: Response, next: NextFunction) => {
	config.api.fileServerHits += 1;
	next();
};

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof HttpError) {
		console.log(err.statusCode, err.message);
		respondWithJSON(res, err.statusCode, {error: err.message});
	} else {
		console.log(err.message);
		respondWithJSON(res, 500, {
			"error": "Something went wrong on our end"
		});
	}
}