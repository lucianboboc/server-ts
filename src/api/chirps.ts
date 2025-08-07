import type {Request, Response} from "express";
import {respondWithJSON} from "./json.js";
import {BadRequestError, NotFoundError} from './errors.js';
import {createChirp, getAllChirps, getChirp} from "../db/queries/chirps.js";

export async function createChirpHandler(req: Request, res: Response) {
	type parameters = {
		body: string;
		userId: string;
	}
	const chirp:parameters = req.body;
	if (!chirp.body || !chirp.userId) {
		throw new BadRequestError("Invalid body or userId");
	}

	validateChirp(chirp.body);
	const result = await createChirp(chirp);
	respondWithJSON(res, 201, result)
}

export async function getChirpsHandler(req: Request, res: Response) {
	const result = await getAllChirps();
	respondWithJSON(res, 200, result)
}

export async function getChirpHandler(req: Request, res: Response) {
	const chirpID = req.params.chirpID;
	const result = await getChirp(chirpID);
	if (!result) {
		throw new NotFoundError(`No chirp found for ID ${chirpID}`);
	}
	respondWithJSON(res, 200, result);
}

function validateChirp(chirp: string) {
	if (chirp.length > 140) {
		throw new BadRequestError("Chirp is too long. Max length is 140");
	}
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