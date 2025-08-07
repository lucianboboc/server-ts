import {Request, Response} from "express";
import {createUser} from "../db/queries/users.js";
import {respondWithJSON} from "./json.js";

export async function createUserHandler(req: Request, res: Response) {
	const email = req.body.email;
	if (!email) {
		throw new Error("Email is required");
	}

	const user = await createUser({email});
	respondWithJSON(res, 201, user)
}