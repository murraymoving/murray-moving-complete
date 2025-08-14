import { pgTable, serial, varchar, text, boolean, integer, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  preferredContact: varchar("preferred_contact", { length: 50 }),
  referralSource: varchar("referral_source", { length: 100 }),
  notes: text("notes"),
  gateCodes: text("gate_codes"),
  specialInstructions: text("special_instructions"),
  claimsHistory: boolean("claims_history").default(false),
  preferredDays: varchar("preferred_days", { length: 100 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("lead"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  jobNumber: varchar("job_number", { length: 50 }),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  originAddress: varchar("origin_address", { length: 255 }).notNull(),
  originCity: varchar("origin_city", { length: 100 }).notNull(),
  originState: varchar("origin_state", { length: 2 }).notNull(),
  originZip: varchar("origin_zip", { length: 10 }).notNull(),
  originFloors: integer("origin_floors"),
  originStairs: boolean("origin_stairs"),
  originElevator: boolean("origin_elevator"),
  originParkingNotes: text("origin_parking_notes"),
  destinationAddress: varchar("destination_address", { length: 255 }).notNull(),
  destinationCity: varchar("destination_city", { length: 100 }).notNull(),
  destinationState: varchar("destination_state", { length: 2 }).notNull(),
  destinationZip: varchar("destination_zip", { length: 10 }).notNull(),
  destinationFloors: integer("destination_floors"),
  destinationStairs: boolean("destination_stairs"),
  destinationElevator: boolean("destination_elevator"),
  destinationParkingNotes: text("destination_parking_notes"),
  preferredDate: date("preferred_date"),
  preferredStartTime: varchar("preferred_start_time", { length: 10 }),
  preferredEndTime: varchar("preferred_end_time", { length: 10 }),
  actualStartTime: varchar("actual_start_time", { length: 10 }),
  actualEndTime: varchar("actual_end_time", { length: 10 }),
  boxCountQuoted: integer("box_count_quoted"),
  boxCountActual: integer("box_count_actual"),
  crewSize: integer("crew_size"),
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }),
  mileageRate: decimal("mileage_rate", { precision: 10, scale: 2 }),
  materialsCost: decimal("materials_cost", { precision: 10, scale: 2 }),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }),
  travelCost: decimal("travel_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }),
  jobType: varchar("job_type", { length: 50 }),
  vehicleType: varchar("vehicle_type", { length: 50 }),
  seasonalMultiplier: decimal("seasonal_multiplier", { precision: 5, scale: 2 }),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Legacy contact/quote tables for compatibility
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  originAddress: varchar("origin_address", { length: 255 }).notNull(),
  destinationAddress: varchar("destination_address", { length: 255 }).notNull(),
  moveDate: varchar("move_date", { length: 50 }).notNull(),
  estimatedBoxes: integer("estimated_boxes"),
  specialItems: text("special_items"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;