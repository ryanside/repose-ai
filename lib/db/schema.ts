import { InferSelectModel, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uuid,
  json,
  varchar,
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull(),
  title: text("title").notNull(),
});

export const chatsInsertSchema = createInsertSchema(chats);
export const chatsSelectSchema = createSelectSchema(chats);
export type Chat = InferSelectModel<typeof chats>;

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  fromSuggestionId: uuid("from_suggestion_id"), // If the message was created from a suggestion
  annotations: json("annotations"), // To store suggestions, fromSuggestionId, etc.
  createdAt: timestamp("created_at").notNull(),
});

export const messagesInsertSchema = createInsertSchema(messages);
export const messagesSelectSchema = createSelectSchema(messages);
export type DBMessage = InferSelectModel<typeof messages>;

export const messageRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));
