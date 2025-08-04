import type {Request, Response} from "express";

export async function validateChirp(req: Request, res: Response) {
	type parameters = {
		body: string;
	};
	let data: parameters = req.body;
	try {
		const chirp = data["body"] as string;
		if (chirp.length > 200) {
			respondWithJSON(res, 400, {"error": "Chirp is too long"});
			return;
		}
		respondWithJSON(res, 200, {"cleanedBody": filterProfane(chirp)});
	} catch (error) {
		console.log(error);
		respondWithJSON(res, 500, {"error": "Something went wrong"});
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

function respondWithJSON(res: Response, statusCode: number, data: any) {
	res.status(statusCode)
		.header("Content-Type", "application/json")
		.json(data)
		.end();
}