import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  company: text("company"),
  phone: text("phone"),
  creditLine: integer("credit_line").default(0),
  isCorporate: boolean("is_corporate").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  cuisine: text("cuisine"),
  imageUrl: text("image_url"),
  rating: integer("rating"),
  minOrder: integer("min_order").default(500),
  deliveryTime: text("delivery_time"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  status: text("status").notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});
