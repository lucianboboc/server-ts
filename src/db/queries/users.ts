import {db} from "../index.js";
import {eq} from "drizzle-orm";
import {NewUser, users} from "../schema.js";

export type UserResponse = Omit<NewUser, "passwordHash">;

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning();

	return makeUserResponse(result);
}

export async function getUser(email: string) {
	const [result] = await db.select().from(users).where(eq(users.email, email))
	return result;
}

export async function deleteAllUsers() {
	await db.delete(users);
}

export function makeUserResponse(user: NewUser) {
	const userResp: UserResponse = {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,

	};
	return userResp;
}