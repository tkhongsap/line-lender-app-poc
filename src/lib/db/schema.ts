import { pgTable, varchar, timestamp, text, index, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  (table) => [index('IDX_session_expire').on(table.expire)]
);

export const webAdminUsers = pgTable('web_admin_users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email').unique().notNull(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  role: varchar('role').notNull().default('VIEWER'),
  active: varchar('active').notNull().default('false'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type WebAdminUser = typeof webAdminUsers.$inferSelect;
export type UpsertWebAdminUser = typeof webAdminUsers.$inferInsert;
