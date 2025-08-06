import type { Request, Response } from "express";
import {config} from "../config.js";

export async function handlerHits(req: Request, res: Response) {
	res.status(200)
		.header("Content-Type", "text/html; charset=utf-8")
		.send(`
			<html>
			<body>
				<h1>Welcome, Chirpy Admin</h1>
				<p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
			</body>
			</html>
		`)
		.end();
}

export async function handlerResetHits(req: Request, res: Response) {
	config.api.fileServerHits = 0;
	res.status(200)
		.send("Hits: 0")
		.end();
}