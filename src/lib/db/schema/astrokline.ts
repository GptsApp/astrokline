import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { user as users } from '@/config/db/schema';

// SQLite has no native UUID, JSON, or timestamp types.
// We use integer({ mode: "timestamp_ms" }) for dates, and text({ mode: "json" }) for JSON/arrays.
export const astrologyProfiles = sqliteTable('astrology_profile', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  birthDate: integer('birth_date', { mode: 'timestamp_ms' }).notNull(),
  birthTime: text('birth_time'),
  birthLocation: text('birth_location').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  sunSign: text('sun_sign'),
  moonSign: text('moon_sign'),
  risingSign: text('rising_sign'),
  lifeStage: text('life_stage'),
  traits: text('traits', { mode: 'json' }).$type<string[]>(),
  klineData: text('kline_data', { mode: 'json' }),
  dominantElement: text('dominant_element'),
  destinyNumber: integer('destiny_number'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const rawUserPrompts = sqliteTable('raw_user_prompt', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  astrologyProfileId: text('astrology_profile_id')
    .notNull()
    .references(() => astrologyProfiles.id, { onDelete: 'cascade' }),
  rawPrompt: text('raw_prompt').notNull(),
  processedText: text('processed_text'),
  extractedEntities: text('extracted_entities', { mode: 'json' }),
  source: text('source').notNull().default('web_form'),
  status: text('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
});
