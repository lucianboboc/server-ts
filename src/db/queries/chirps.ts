import {db} from '../index.js';
import {eq, asc, desc} from 'drizzle-orm';
import {chirps, NewChirp} from '../schema.js';

export type Sorting = "asc" | "desc";

export async function createChirp(chirp: NewChirp) {
	const [result] = await db
		.insert(chirps)
		.values(chirp)
		.onConflictDoNothing()
		.returning();
	return result;
}

export async function getAllChirps(sort: Sorting) {
	return db
		.select()
		.from(chirps)
		.orderBy(sort == "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
}

export async function getChirpsForUser(userId: string, sort: Sorting) {
	return db
		.select()
		.from(chirps)
		.where(eq(chirps.userId, userId))
		.orderBy(sort == "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
}

export async function getChirp(id: string) {
	const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
	return result;
}

export async function deleteChirp(id: string) {
	return db
		.delete(chirps)
		.where(eq(chirps.id, id));
}