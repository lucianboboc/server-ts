import type {Request} from "express";
import {describe, it, expect, beforeAll} from "vitest";
import {checkPasswordHash, getBearerToken, makeJWT, validateJWT} from "./auth";
import {hashPassword} from "./auth";
import {UnauthorizedError} from "./errors";

describe("Password Hashing", () => {
	const password1 = "correctPassword123!";
	const password2 = "anotherPassword456!";
	let hash1: string;
	let hash2: string;

	beforeAll(async () => {
		hash1 = await hashPassword(password1);
		hash2 = await hashPassword(password2);
	});

	it("should return true for the correct password1", async () => {
		const result = await checkPasswordHash(password1, hash1);
		expect(result).toBe(true);
	});

	it("should return false for an incorrect password", async () => {
		const result = await checkPasswordHash("wrongpassword", hash2);
		expect(result).toBe(false);
	})

	it("should return false when password doesn't match a different hash", async () => {
		const result = await checkPasswordHash(password1, hash2);
		expect(result).toBe(false);
	});

	it("should return false for an empty password", async () => {
		const result = await checkPasswordHash("", hash1);
		expect(result).toBe(false);
	});

	it("should return false for an invalid hash", async () => {
		const result = await checkPasswordHash(password1, "invalidhash");
		expect(result).toBe(false);
	});
});

describe("JWT", () => {
	const secret = "my$ecret$string"
	const otherSecret = "myOther$ecret$string"
	const userID = "123456"
	let token: string;

	beforeAll(() => {
		token = makeJWT(userID, 3600, secret);
	});

	it("should validate a token", () => {
		const result = validateJWT(token, secret);
		expect(result).toBe(userID);
	});

	it("should throw an error for an invalid token string", () => {
		expect(() => validateJWT("invalidtoken", secret))
			.toThrow(UnauthorizedError);
	});

	it("should throw an error when the token is signed with a wrong secret", () => {
		expect(() => validateJWT(token, otherSecret))
			.toThrow(UnauthorizedError);
	});
});

describe("Bearer token", () => {
	const token = "my$ecret$token"

	it("should return token from request", () => {
		let req = {
			header: (name: string) => `Bearer ${token}`
		} as Request;
		const result = getBearerToken(req);
		expect(result).toBe(token);
	})

	it("should return throw an error if token is missing", () => {
		let req = {
			header: (name: string) => "invalid"
		} as Request;

		expect(() => getBearerToken(req))
			.toThrow(UnauthorizedError);
	})
})