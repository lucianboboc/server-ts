import {pgTable, timestamp, varchar, uuid} from 'drizzle-orm/pg-core';

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	email: varchar("email", {length: 256}).unique().notNull(),
	passwordHash: varchar("hashed_password").notNull().default("unset"),
});

export const chirps = pgTable("chirps", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	body: varchar("body").notNull(),
	userId: uuid("user_id")
		.references(() => users.id,  {onDelete: "cascade"})
		.notNull(),
})

export const refreshTokens = pgTable("refresh_tokens", {
	token: varchar("token").primaryKey(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	userId: uuid("user_id")
		.references(() => users.id, {onDelete: "cascade"}),
	expiresAt: timestamp("expires_at").notNull(),
	revokedAt: timestamp("revokedAt")
});

export type NewUser = typeof users.$inferInsert;
export type NewChirp = typeof chirps.$inferInsert;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;