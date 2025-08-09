import {db} from '../index.js';
import {eq} from 'drizzle-orm';
import {chirps, NewChirp} from '../schema.js';

export async function createChirp(chirp: NewChirp) {
	const [result] = await db
		.insert(chirps)
		.values(chirp)
		.onConflictDoNothing()
		.returning();
	return result;
}

export async function getAllChirps() {
	return db.select().from(chirps);
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