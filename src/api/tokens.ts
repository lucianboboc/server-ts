import {Request, Response} from "express";
import {getBearerToken, makeJWT} from "./auth.js";
import {getRefreshToken, revokeRefreshToken} from "../db/queries/tokens.js";
import {UnauthorizedError} from "./errors.js";
import {config} from "../config.js";
import {respondWithJSON} from "./json.js";


export async function refreshTokenHandler(req: Request, res: Response) {
	const token = getBearerToken(req);
	const refreshToken = await getRefreshToken(token);
	if (!refreshToken || !refreshToken.userId || refreshToken.revokedAt) {
		throw new UnauthorizedError("Invalid refresh token");
	}

	const newJWTToken = makeJWT(refreshToken.userId, 3600, config.api.secret);
	respondWithJSON(res, 200, {token: newJWTToken});
}

export async function revokeRefreshTokenHandler(req: Request, res: Response) {
	const token = getBearerToken(req);
	const revokedToken = await revokeRefreshToken(token);
	if (!revokedToken || !revokedToken.revokedAt) {
		throw new UnauthorizedError("Invalid refresh token");
	}

	res.status(204)
		.end();
}