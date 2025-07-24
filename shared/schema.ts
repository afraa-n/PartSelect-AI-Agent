/**
 * Database Schema & API Types - Shared types for client and server
 * Defines database tables, validation schemas, and API request/response types
 */
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for customer account management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversations.id),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  productCards: jsonb("product_cards").$type<ProductCard[] | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product types
export const productSchema = z.object({
  partNumber: z.string(),
  name: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  compatibility: z.array(z.string()),
  category: z.enum(["refrigerator", "dishwasher"]),
  buyLink: z.string().optional(),
});

export const productCardSchema = z.object({
  partNumber: z.string(),
  name: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  buyLink: z.string().optional(),
});

// Chat request/response schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string(),
});

export const chatResponseSchema = z.object({
  text: z.string(),
  productCards: z.array(productCardSchema).optional(),
  conversationId: z.string(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  productCards: true,
});

// Types
export type Product = z.infer<typeof productSchema>;
export type ProductCard = z.infer<typeof productCardSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
