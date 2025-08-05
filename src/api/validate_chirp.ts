import type {Request, Response} from "express";
import {respondWithJSON} from "./json.js";
import {BadRequestError} from './errors.js';

export async function validateChirp(req: Request, res: Response) {
	type parameters = {
		body: string;
	};
	let data: parameters = req.body;
	const chirp = data["body"] as string;
	if (chirp.length > 140) {
		throw new BadRequestError("Chirp is too long. Max length is 140");
	}

	respondWithJSON(res, 200, {
		"cleanedBody": filterProfane(chirp)
	});
}

function filterProfane(data: string) {
	const profaneWords = new Set(["kerfuffle", "sharbert", "fornax"]);
	const words = data.split(" ").map(word => {
		if (profaneWords.has(word.toLowerCase())) {
			return "****";
		}
		return word;
	});
	return words.join(" ");
}