import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth"; // Assuming ShipAny has an existing users table

export const astrologyProfiles = pgTable("astrology_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  birthDate: timestamp("birth_date").notNull(),
  birthTime: text("birth_time"),
  birthLocation: text("birth_location").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  sunSign: text("sun_sign"),
  moonSign: text("moon_sign"),
  risingSign: text("rising_sign"),
  lifeStage: text("life_stage"),
  traits: text("traits").array(),
  klineData: jsonb("kline_data"),
  dominantElement: text("dominant_element"),
  destinyNumber: integer("destiny_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rawUserPrompts = pgTable("raw_user_prompt", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  astrologyProfileId: uuid("astrology_profile_id").notNull().references(() => astrologyProfiles.id, { onDelete: 'cascade' }),
  rawPrompt: text("raw_prompt").notNull(),
  processedText: text("processed_text"),
  extractedEntities: jsonb("extracted_entities"),
  source: text("source").notNull().default('web_form'),
  status: text("status").notNull().default('pending'),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
