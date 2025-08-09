import {Request, Response} from "express";
import {createUser, getUser, makeUserResponse} from "../db/queries/users.js";
import {respondWithJSON} from "./json.js";
import {checkPasswordHash, hashPassword, makeJWT, makeRefreshToken} from "./auth.js";
import {UnauthorizedError} from "./errors.js";
import {config} from "../config.js";
import {createRefreshToken} from "../db/queries/tokens.js";

export async function createUserHandler(req: Request, res: Response) {
	const {email, password} = req.body;
	if (!email || !password) {
		throw new Error("Missing credentials");
	}

	const passwordHash = await hashPassword(password);
	const userResp = await createUser({email, passwordHash});
	respondWithJSON(res, 201, userResp)
}

export async function loginUserHandler(req: Request, res: Response) {
	type parameters = {
		email: string;
		password: string;
	}
	let {email, password}: parameters = req.body;
	if (!email || !password) {
		throw new Error("Missing credentials");
	}

	const user = await getUser(email);
	if (!user) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const valid = await checkPasswordHash(password, user.passwordHash);
	if (!valid) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const expiresInSeconds = 3600;
	const userResp = makeUserResponse(user);
	const token = makeJWT(userResp.id!, expiresInSeconds, config.api.secret);
	const refreshToken = makeRefreshToken();
	const tokenResult = await createRefreshToken(refreshToken, userResp.id!, addDays(new Date(), 60))
	console.log(tokenResult);
	respondWithJSON(res, 200, {...userResp, token, refreshToken: tokenResult.token});
}

function addDays(date: Date, days: number) {
	var result = new Date(date);
	result.setDate(date.getDate() + days);
	return result;
}