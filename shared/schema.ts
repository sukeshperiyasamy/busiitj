import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model with roles for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "driver", "student"] }).notNull().default("student"),
  busId: integer("bus_id"),
});

// Bus model for tracking buses
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: text("bus_number").notNull().unique(), // B1, B2, etc.
  isActive: boolean("is_active").default(false),
  lastLocation: text("last_location"), // JSON string of coordinates
  lastUpdated: timestamp("last_updated"),
});

// Bus locations history for tracking
export const busLocations = pgTable("bus_locations", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Schedules for storing bus schedules
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull(),
  day: text("day", { enum: ["weekday", "sunday"] }).notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  route: text("route").notNull(),
  isArrival: boolean("is_arrival").default(false), // if true, it's an arrival at campus
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  username: true,
  password: true,
  role: true,
  busId: true,
});

export const insertBusSchema = createInsertSchema(buses).pick({
  busNumber: true,
  isActive: true,
  lastLocation: true,
  lastUpdated: true,
});

export const insertBusLocationSchema = createInsertSchema(busLocations).pick({
  busId: true,
  latitude: true,
  longitude: true,
  isActive: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  busId: true,
  day: true,
  departureTime: true,
  arrivalTime: true,
  startLocation: true,
  endLocation: true,
  route: true,
  isArrival: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;

export type BusLocation = typeof busLocations.$inferSelect;
export type InsertBusLocation = z.infer<typeof insertBusLocationSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

// Utility types for the frontend
export type UserWithoutPassword = Omit<User, 'password'>;

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// For MongoDB - not using drizzle
export interface MongoUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "driver" | "student";
  busId?: number;
}

export interface MongoBus {
  id: string;
  busNumber: string;
  isActive: boolean;
  lastLocation?: {
    latitude: string;
    longitude: string;
  };
  lastUpdated?: Date;
}

export interface MongoBusLocation {
  id: string;
  busId: string;
  latitude: string;
  longitude: string;
  timestamp: Date;
  isActive: boolean;
}

export interface MongoSchedule {
  id: string;
  busId: string;
  day: "weekday" | "sunday";
  departureTime: string;
  arrivalTime: string;
  startLocation: string;
  endLocation: string;
  route: string;
  isArrival: boolean;
}
