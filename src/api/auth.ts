import bcrypt from "bcrypt";
import type {JwtPayload} from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import {UnauthorizedError} from "./errors.js";
import type {Request} from "express";
import {randomBytes} from "node:crypto";

const TOKEN_ISSUER = "chirpy";

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + expiresIn;
	const payload: Payload = {
		iss: TOKEN_ISSUER,
		sub: userID,
		exp: expiresAt,
		iat: issuedAt,
	}

	return jwt.sign(payload, secret, {algorithm: "HS256"});
}

export function validateJWT(tokenString: string, secret: string) {
	let payload: Payload
	try {
		payload = jwt.verify(tokenString, secret) as Payload;
	} catch (error) {
		console.log(error);
		throw new UnauthorizedError("Invalid JWT token");
	}

	if (payload.iss !== TOKEN_ISSUER) {
		throw new UnauthorizedError("Invalid issuer");
	}
	if (!payload.sub) {
		throw new UnauthorizedError("Invalid token userID");
	}

	return payload.sub;
}

export function getBearerToken(req: Request): string {
	const authHeader = req.header("Authorization");
	if (!authHeader) {
		throw new UnauthorizedError("Unauthorized");
	}
	const [_, token] = authHeader.split(" ");
	if (!token) {
		throw new UnauthorizedError("Unauthorized");
	}
	return token;
}

export function makeRefreshToken() {
	const bytes = randomBytes(256);
	return bytes.toString('hex');
}

export async function hashPassword(password: string) {
	return bcrypt.hash(password, 10);
}

export async function checkPasswordHash(password: string, hash: string) {
	return bcrypt.compare(password, hash);
}

