import type { Request, Response } from "express";
import {config} from "../config.js";

export async function handlerHits(req: Request, res: Response) {
	res.status(200)
		.send(`Hits: ${config.fileserverHits}`)
		.end();
}

export async function handlerResetHits(req: Request, res: Response) {
	config.fileserverHits = 0;
	res.status(200)
		.send("Hits: 0")
		.end();
}