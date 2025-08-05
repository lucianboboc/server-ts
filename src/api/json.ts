import type {Response} from "express";

export const respondWithJSON = (res: Response, statusCode: number, data: any) => {
	res.status(statusCode)
		.header("Content-Type", "application/json")
		.json(data)
		.end();
}