import type { Request, Response } from "express";

export async function handlerReadiness(req: Request, res: Response) {
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.send("OK");
	res.end();
}