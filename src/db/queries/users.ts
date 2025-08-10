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

export async function updateUser(user: NewUser): Promise<UserResponse | undefined> {
	const [result] = await db
		.update(users)
		.set({email: user.email, passwordHash: user.passwordHash})
		.returning();
	if (!result) {
		return undefined;
	}
	return makeUserResponse(result);
}

export async function getUser(email: string) {
	const [result] = await db.select().from(users).where(eq(users.email, email))
	return result;
}

export async function upgradeUserToChirpyRed(userId: string) {
	const [result] = await db
		.update(users)
		.set({isChirpyRed: true})
		.where(eq(users.id, userId))
		.returning();
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
		isChirpyRed: user.isChirpyRed,
	};
	return userResp;
}