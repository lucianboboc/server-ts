import {Request, Response} from "express";
import {createUser, getUser, makeUserResponse} from "../db/queries/users.js";
import {respondWithJSON} from "./json.js";
import {checkPasswordHash, hashPassword, makeJWT} from "./auth.js";
import {UnauthorizedError} from "./errors.js";
import {config} from "../config.js";

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
		expiresInSeconds?: number;
	}
	let {email, password, expiresInSeconds}: parameters = req.body;
	if (!email || !password) {
		throw new Error("Missing credentials");
	}
	if (!expiresInSeconds) {
		expiresInSeconds = 3600;
	}

	const user = await getUser(email);
	if (!user) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const valid = await checkPasswordHash(password, user.passwordHash);
	if (!valid) {
		throw new UnauthorizedError("Invalid credentials");
	}

	const userResp = makeUserResponse(user);
	const token = makeJWT(userResp.id!, expiresInSeconds, config.api.secret);
	respondWithJSON(res, 200, {...userResp, token})
}