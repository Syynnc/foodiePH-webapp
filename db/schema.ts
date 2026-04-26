import { pgTable, uuid, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";

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
  rating: numeric("rating", { precision: 2, scale: 1 }),
  minOrder: integer("min_order").default(500),
  deliveryTime: text("delivery_time"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // we will interpret as PHP
  imageUrl: text("image_url"),
  category: text("category"), // e.g., 'Pizza', 'Burger'
  rating: numeric("rating", { precision: 2, scale: 1 }),
  isAvailable: boolean("is_available").default(true),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  status: text("status").notNull().default("pending"), // pending, active, completed, cancelled
  subTotal: integer("sub_total").notNull().default(0),
  discount: integer("discount").default(0),
  totalAmount: integer("total_amount").notNull(),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
