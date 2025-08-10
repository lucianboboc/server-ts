import type {Request, Response} from "express";
import {respondWithJSON} from "./json.js";
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from './errors.js';
import {createChirp, deleteChirp, getAllChirps, getChirp, getChirpsForUser} from "../db/queries/chirps.js";
import type {Sorting} from '../db/queries/chirps.js';
import {getBearerToken, validateJWT} from "./auth.js";
import {config} from "../config.js";

export async function createChirpHandler(req: Request, res: Response) {
	const token = getBearerToken(req);
	if (!token) {
		throw new UnauthorizedError("Invalid credentials");
	}
	const userID = validateJWT(token, config.api.secret);

	type parameters = {
		body: string;
		userId: string;
	}
	const chirp: parameters = req.body;
	if (!chirp.body) {
		throw new BadRequestError("Invalid body or userId");
	}

	chirp.userId = userID;
	validateChirp(chirp.body);
	const result = await createChirp(chirp);
	respondWithJSON(res, 201, result)
}

export async function getChirpsHandler(req: Request, res: Response) {
	const {authorId, sort} = req.query;

	const sortBy: Sorting = isSorting(sort) ? sort : "asc";
	console.log(`Sorting value ${sort}`);
	if (typeof authorId === 'string' && authorId.length > 0) {
		const result = await getChirpsForUser(authorId, sortBy)
		respondWithJSON(res, 200, result)
	} else {
		const result = await getAllChirps(sortBy);
		respondWithJSON(res, 200, result)
	}
}

export async function getChirpHandler(req: Request, res: Response) {
	const chirpID = req.params.chirpID;
	const result = await getChirp(chirpID);
	if (!result) {
		throw new NotFoundError(`No chirp found for ID ${chirpID}`);
	}
	respondWithJSON(res, 200, result);
}

export async function deleteChirpHandler(req: Request, res: Response) {
	const token = getBearerToken(req);
	const userId = validateJWT(token, config.api.secret);
	const chirpID	= req.params.chirpID;
	const chirp = await getChirp(chirpID);
	if (!chirp) {
		throw new NotFoundError(`No chirp found for ID ${chirpID}`);
	}
	if (chirp.userId !== userId) {
		throw new ForbiddenError("Forbidden");
	}
	await deleteChirp(chirpID);
	res.status(204)
		.end();
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

function isSorting(sort: unknown): sort is Sorting {
	return sort === "asc" || sort === "desc";
}