import { pgTable, uuid, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  phone: text("phone"),
  creditLine: integer("credit_line").default(0),
  isCorporate: boolean("is_corporate").default(false),
  role: text("role").notNull().default("customer"), // 'customer' | 'driver' | 'admin' | 'restaurant'
  /** Full delivery address entered at sign-up or in account settings */
  address: text("address"),
  /** Philippine region auto-detected from address (e.g. "NCR", "R7") */
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().references(() => profiles.id),
  firstName: text("first_name"),
  lastName: text("last_name"),
  licenseNumber: text("license_number"),
  vehicleType: text("vehicle_type").default("motorcycle"),
  plateNumber: text("plate_number"),
  isAvailable: boolean("is_available").default(true),
  isActive: boolean("is_active").default(true),
  /** The Philippine region/zone this driver is registered to operate in */
  serviceRegion: text("service_region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => profiles.id),
  name: text("name").notNull(),
  cuisine: text("cuisine"),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  imageUrl: text("image_url"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  minOrder: integer("min_order").default(500),
  deliveryTime: text("delivery_time"),
  isActive: boolean("is_active").default(true),
  /** Philippine region/zone where this restaurant is located */
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  isAvailable: boolean("is_available").default(true),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  status: text("status").notNull().default("preparing"),
  subTotal: integer("sub_total").notNull().default(0),
  discount: integer("discount").default(0),
  totalAmount: integer("total_amount").notNull(),
  deliveryAddress: text("delivery_address"),
  /** Auto-detected Philippine region from deliveryAddress */
  deliveryRegion: text("delivery_region"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  restaurantId: uuid("restaurant_id").notNull().references(() => restaurants.id),
  rating: integer("rating").notNull(), // 1–5
  comment: text("comment"),
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

export const driverApplications = pgTable("driver_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  status: text("status").notNull().default("pending"), // pending | approved | denied
  vehicleType: text("vehicle_type").default("motorcycle"),
  plateNumber: text("plate_number"),
  licenseNumber: text("license_number"),
  govIdUrl: text("gov_id_url"),
  /** The Philippine region the driver intends to operate in */
  serviceRegion: text("service_region"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const restaurantApplications = pgTable("restaurant_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  status: text("status").notNull().default("pending"), // pending | approved | denied
  restaurantName: text("restaurant_name").notNull(),
  cuisine: text("cuisine"),
  address: text("address"),
  phone: text("phone"),
  description: text("description"),
  // Extended fields
  openingHours: text("opening_hours"),         // e.g. "Mon–Sat 10AM–9PM"
  minOrder: integer("min_order"),               // minimum order in PHP pesos
  deliveryTime: text("delivery_time"),          // e.g. "30–45 mins"
  website: text("website"),                     // optional URL
  facebook: text("facebook"),                  // optional FB page handle/URL
  seatingCapacity: integer("seating_capacity"), // optional dine-in info
  permitUrl: text("permit_url"),
  logoUrl: text("logo_url"),                   // uploaded restaurant logo/photo
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
