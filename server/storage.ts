import { MongoClient, ServerApiVersion } from "mongodb";
import { 
  type User, 
  type InsertUser, 
  type Bus, 
  type InsertBus, 
  type BusLocation, 
  type InsertBusLocation, 
  type Schedule, 
  type InsertSchedule,
  MongoUser,
  MongoBus,
  MongoBusLocation,
  MongoSchedule
} from "@shared/schema";

// MongoDB setup
const uri = process.env.MONGODB_URI || "mongodb+srv://m24im1007:Sukesh9595@@busapp.2iugnw6.mongodb.net/?retryWrites=true&w=majority&appName=busapp";
let client: MongoClient | null = null;

async function connectToMongo() {
  if (client) return client;
  
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    console.log("Connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Bus operations
  getBus(id: string): Promise<Bus | null>;
  getBusById(id: number): Promise<Bus | null>;
  getBuses(): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBusStatus(id: string, isActive: boolean): Promise<Bus | null>;
  updateBusLocation(id: string, latitude: string, longitude: string): Promise<Bus | null>;
  
  // Bus location operations
  createBusLocation(location: InsertBusLocation): Promise<BusLocation>;
  getBusLocations(busId: string, limit?: number): Promise<BusLocation[]>;
  
  // Schedule operations
  getSchedules(day: string, busId?: string): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  
  // Seed initial data
  seedInitialData(): Promise<void>;
}

export class MongoStorage implements IStorage {
  private async getDb() {
    const client = await connectToMongo();
    return client.db("busTracker");
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.collection<MongoUser>("users").findOne({ id });
    if (!user) return null;
    return this.mapMongoUserToUser(user);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.collection<MongoUser>("users").findOne({ username });
    if (!user) return null;
    return this.mapMongoUserToUser(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDb();
    const user = await db.collection<MongoUser>("users").findOne({ email });
    if (!user) return null;
    return this.mapMongoUserToUser(user);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const db = await this.getDb();
    const id = Math.random().toString(36).substring(2, 15);
    
    const user: MongoUser = {
      id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role as "admin" | "driver" | "student",
      busId: userData.busId,
    };
    
    await db.collection<MongoUser>("users").insertOne(user);
    return this.mapMongoUserToUser(user);
  }

  async getUsers(): Promise<User[]> {
    const db = await this.getDb();
    const users = await db.collection<MongoUser>("users").find().toArray();
    return users.map(this.mapMongoUserToUser);
  }

  // Bus operations
  async getBus(id: string): Promise<Bus | null> {
    const db = await this.getDb();
    const bus = await db.collection<MongoBus>("buses").findOne({ id });
    if (!bus) return null;
    return this.mapMongobusToBus(bus);
  }

  async getBusById(id: number): Promise<Bus | null> {
    const db = await this.getDb();
    const bus = await db.collection<MongoBus>("buses").findOne({ 
      busNumber: id === 1 ? "B1" : "B2" 
    });
    if (!bus) return null;
    return this.mapMongobusToBus(bus);
  }

  async getBuses(): Promise<Bus[]> {
    const db = await this.getDb();
    const buses = await db.collection<MongoBus>("buses").find().toArray();
    return buses.map(this.mapMongobusToBus);
  }

  async createBus(busData: InsertBus): Promise<Bus> {
    const db = await this.getDb();
    const id = Math.random().toString(36).substring(2, 15);
    
    const bus: MongoBus = {
      id,
      busNumber: busData.busNumber,
      isActive: busData.isActive || false,
      lastLocation: busData.lastLocation ? JSON.parse(busData.lastLocation) : undefined,
      lastUpdated: busData.lastUpdated,
    };
    
    await db.collection<MongoBus>("buses").insertOne(bus);
    return this.mapMongobusToBus(bus);
  }

  async updateBusStatus(id: string, isActive: boolean): Promise<Bus | null> {
    const db = await this.getDb();
    const result = await db.collection<MongoBus>("buses").findOneAndUpdate(
      { id },
      { $set: { isActive, lastUpdated: new Date() } },
      { returnDocument: "after" }
    );
    
    if (!result) return null;
    return this.mapMongobusToBus(result);
  }

  async updateBusLocation(id: string, latitude: string, longitude: string): Promise<Bus | null> {
    const db = await this.getDb();
    const lastLocation = { latitude, longitude };
    const lastUpdated = new Date();
    
    const result = await db.collection<MongoBus>("buses").findOneAndUpdate(
      { id },
      { $set: { lastLocation, lastUpdated, isActive: true } },
      { returnDocument: "after" }
    );
    
    if (!result) return null;
    return this.mapMongobusToBus(result);
  }

  // Bus location operations
  async createBusLocation(locationData: InsertBusLocation): Promise<BusLocation> {
    const db = await this.getDb();
    const id = Math.random().toString(36).substring(2, 15);
    
    const location: MongoBusLocation = {
      id,
      busId: locationData.busId.toString(),
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: new Date(),
      isActive: locationData.isActive || true,
    };
    
    await db.collection<MongoBusLocation>("busLocations").insertOne(location);
    return this.mapMongoBusLocationToBusLocation(location);
  }

  async getBusLocations(busId: string, limit: number = 100): Promise<BusLocation[]> {
    const db = await this.getDb();
    const locations = await db.collection<MongoBusLocation>("busLocations")
      .find({ busId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
      
    return locations.map(this.mapMongoBusLocationToBusLocation);
  }

  // Schedule operations
  async getSchedules(day: string, busId?: string): Promise<Schedule[]> {
    const db = await this.getDb();
    const query: any = { day };
    if (busId) query.busId = busId;
    
    const schedules = await db.collection<MongoSchedule>("schedules").find(query).toArray();
    return schedules.map(this.mapMongoScheduleToSchedule);
  }

  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const db = await this.getDb();
    const id = Math.random().toString(36).substring(2, 15);
    
    const schedule: MongoSchedule = {
      id,
      busId: scheduleData.busId.toString(),
      day: scheduleData.day as "weekday" | "sunday",
      departureTime: scheduleData.departureTime,
      arrivalTime: scheduleData.arrivalTime,
      startLocation: scheduleData.startLocation,
      endLocation: scheduleData.endLocation,
      route: scheduleData.route,
      isArrival: scheduleData.isArrival || false,
    };
    
    await db.collection<MongoSchedule>("schedules").insertOne(schedule);
    return this.mapMongoScheduleToSchedule(schedule);
  }

  // Helper methods for mapping MongoDB documents to our types
  private mapMongoUserToUser(mongoUser: MongoUser): User {
    return {
      id: parseInt(mongoUser.id, 10) || 0,
      name: mongoUser.name,
      email: mongoUser.email,
      username: mongoUser.username,
      password: mongoUser.password,
      role: mongoUser.role,
      busId: mongoUser.busId,
    };
  }

  private mapMongobusToBus(mongoBus: MongoBus): Bus {
    return {
      id: parseInt(mongoBus.id, 10) || 0,
      busNumber: mongoBus.busNumber,
      isActive: mongoBus.isActive,
      lastLocation: mongoBus.lastLocation ? JSON.stringify(mongoBus.lastLocation) : null,
      lastUpdated: mongoBus.lastUpdated || null,
    };
  }

  private mapMongoBusLocationToBusLocation(mongoLocation: MongoBusLocation): BusLocation {
    return {
      id: parseInt(mongoLocation.id, 10) || 0,
      busId: parseInt(mongoLocation.busId, 10) || 0,
      latitude: mongoLocation.latitude,
      longitude: mongoLocation.longitude,
      timestamp: mongoLocation.timestamp,
      isActive: mongoLocation.isActive,
    };
  }

  private mapMongoScheduleToSchedule(mongoSchedule: MongoSchedule): Schedule {
    return {
      id: parseInt(mongoSchedule.id, 10) || 0,
      busId: parseInt(mongoSchedule.busId, 10) || 0,
      day: mongoSchedule.day,
      departureTime: mongoSchedule.departureTime,
      arrivalTime: mongoSchedule.arrivalTime,
      startLocation: mongoSchedule.startLocation,
      endLocation: mongoSchedule.endLocation,
      route: mongoSchedule.route,
      isArrival: mongoSchedule.isArrival,
    };
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    const db = await this.getDb();
    
    // Check if we already have data
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount > 0) return;
    
    // Create admin user
    await this.createUser({
      name: "Admin",
      email: "admin@iitj.ac.in",
      username: "admin",
      password: "admin123", // In production, use proper password hashing
      role: "admin",
    });
    
    // Create buses
    const bus1 = await this.createBus({
      busNumber: "B1",
      isActive: false,
    });
    
    const bus2 = await this.createBus({
      busNumber: "B2",
      isActive: false,
    });
    
    // Add weekday schedules
    // Departures from campus
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "weekday",
      departureTime: "6:30 AM",
      arrivalTime: "7:40 AM",
      startLocation: "IITJ",
      endLocation: "GPRA",
      route: "via Paota and Railway Station",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: parseInt(bus2.id.toString()),
      day: "weekday",
      departureTime: "6:30 AM",
      arrivalTime: "7:40 AM",
      startLocation: "IITJ",
      endLocation: "Jaljog Circle",
      route: "via Paota and Riktiya Bheruji Circle",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "weekday",
      departureTime: "10:00 AM",
      arrivalTime: "11:00 AM",
      startLocation: "IITJ",
      endLocation: "AIIMS Jodhpur",
      route: "via Paota – MBM – AIIMS",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: parseInt(bus2.id.toString()),
      day: "weekday",
      departureTime: "11:00 AM",
      arrivalTime: "12:00 PM",
      startLocation: "IITJ",
      endLocation: "MBM",
      route: "via Paota and Railway Station",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "weekday",
      departureTime: "3:00 PM",
      arrivalTime: "4:00 PM",
      startLocation: "IITJ",
      endLocation: "AIIMS Jodhpur",
      route: "via Paota – Railway Station",
      isArrival: false,
    });
    
    // Arrivals at campus
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "weekday",
      departureTime: "7:45 AM",
      arrivalTime: "8:50 AM",
      startLocation: "GPRA",
      endLocation: "IITJ",
      route: "via MBM – Paota – Mandore",
      isArrival: true,
    });
    
    await this.createSchedule({
      busId: parseInt(bus2.id.toString()),
      day: "weekday",
      departureTime: "7:45 AM",
      arrivalTime: "8:50 AM",
      startLocation: "Jaljog Circle",
      endLocation: "IITJ",
      route: "",
      isArrival: true,
    });
    
    // Sunday schedules
    // Departures
    await this.createSchedule({
      busId: parseInt(bus2.id.toString()),
      day: "sunday",
      departureTime: "9:30 AM",
      arrivalTime: "10:30 AM",
      startLocation: "IITJ",
      endLocation: "MBM",
      route: "via Paota – Riktiya Bheruji Circle – MBM",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "sunday",
      departureTime: "10:30 AM",
      arrivalTime: "11:30 AM",
      startLocation: "IITJ",
      endLocation: "MBM",
      route: "via Paota – MBM",
      isArrival: false,
    });
    
    // Arrivals
    await this.createSchedule({
      busId: parseInt(bus2.id.toString()),
      day: "sunday",
      departureTime: "11:30 AM",
      arrivalTime: "12:30 PM",
      startLocation: "MBM",
      endLocation: "IITJ",
      route: "via Paota – Mandore – IITJ",
      isArrival: true,
    });
    
    await this.createSchedule({
      busId: parseInt(bus1.id.toString()),
      day: "sunday",
      departureTime: "1:30 PM",
      arrivalTime: "2:30 PM",
      startLocation: "MBM",
      endLocation: "IITJ",
      route: "via MBM College – Paota – IITJ",
      isArrival: true,
    });
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private buses: Map<string, Bus>;
  private busLocations: Map<string, BusLocation[]>;
  private schedules: Map<string, Schedule>;
  private userId: number;
  private busId: number;
  private scheduleId: number;
  private locationId: number;

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.busLocations = new Map();
    this.schedules = new Map();
    this.userId = 1;
    this.busId = 1;
    this.scheduleId = 1;
    this.locationId = 1;
  }
  
  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      password: userData.password,
      role: userData.role as "admin" | "driver" | "student",
      busId: userData.busId,
    };
    
    this.users.set(id.toString(), user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Bus operations
  async getBus(id: string): Promise<Bus | null> {
    return this.buses.get(id) || null;
  }

  async getBusById(id: number): Promise<Bus | null> {
    for (const bus of this.buses.values()) {
      if (bus.busNumber === (id === 1 ? "B1" : "B2")) {
        return bus;
      }
    }
    return null;
  }

  async getBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async createBus(busData: InsertBus): Promise<Bus> {
    const id = this.busId++;
    const bus: Bus = {
      id,
      busNumber: busData.busNumber,
      isActive: busData.isActive || false,
      lastLocation: busData.lastLocation,
      lastUpdated: busData.lastUpdated || null,
    };
    
    this.buses.set(id.toString(), bus);
    return bus;
  }

  async updateBusStatus(id: string, isActive: boolean): Promise<Bus | null> {
    const bus = this.buses.get(id);
    if (!bus) return null;
    
    bus.isActive = isActive;
    bus.lastUpdated = new Date();
    this.buses.set(id, bus);
    
    return bus;
  }

  async updateBusLocation(id: string, latitude: string, longitude: string): Promise<Bus | null> {
    const bus = this.buses.get(id);
    if (!bus) return null;
    
    bus.lastLocation = JSON.stringify({ latitude, longitude });
    bus.lastUpdated = new Date();
    bus.isActive = true;
    this.buses.set(id, bus);
    
    return bus;
  }

  // Bus location operations
  async createBusLocation(locationData: InsertBusLocation): Promise<BusLocation> {
    const id = this.locationId++;
    const location: BusLocation = {
      id,
      busId: locationData.busId,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timestamp: new Date(),
      isActive: locationData.isActive || true,
    };
    
    const busId = locationData.busId.toString();
    const locations = this.busLocations.get(busId) || [];
    locations.push(location);
    this.busLocations.set(busId, locations);
    
    return location;
  }

  async getBusLocations(busId: string, limit: number = 100): Promise<BusLocation[]> {
    const locations = this.busLocations.get(busId) || [];
    return locations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Schedule operations
  async getSchedules(day: string, busId?: string): Promise<Schedule[]> {
    const result: Schedule[] = [];
    
    for (const schedule of this.schedules.values()) {
      if (schedule.day === day && (!busId || schedule.busId.toString() === busId)) {
        result.push(schedule);
      }
    }
    
    return result;
  }

  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleId++;
    const schedule: Schedule = {
      id,
      busId: scheduleData.busId,
      day: scheduleData.day as "weekday" | "sunday",
      departureTime: scheduleData.departureTime,
      arrivalTime: scheduleData.arrivalTime,
      startLocation: scheduleData.startLocation,
      endLocation: scheduleData.endLocation,
      route: scheduleData.route,
      isArrival: scheduleData.isArrival || false,
    };
    
    this.schedules.set(id.toString(), schedule);
    return schedule;
  }

  // Seed initial data
  async seedInitialData(): Promise<void> {
    // Check if we already have data
    if (this.users.size > 0) return;
    
    // Create admin user
    await this.createUser({
      name: "Admin",
      email: "admin@iitj.ac.in",
      username: "admin",
      password: "admin123", // In production, use proper password hashing
      role: "admin",
    });
    
    // Create buses
    const bus1 = await this.createBus({
      busNumber: "B1",
      isActive: false,
    });
    
    const bus2 = await this.createBus({
      busNumber: "B2",
      isActive: false,
    });
    
    // Add weekday schedules
    // Departures from campus
    await this.createSchedule({
      busId: bus1.id,
      day: "weekday",
      departureTime: "6:30 AM",
      arrivalTime: "7:40 AM",
      startLocation: "IITJ",
      endLocation: "GPRA",
      route: "via Paota and Railway Station",
      isArrival: false,
    });
    
    await this.createSchedule({
      busId: bus2.id,
      day: "weekday",
      departureTime: "6:30 AM",
      arrivalTime: "7:40 AM",
      startLocation: "IITJ",
      endLocation: "Jaljog Circle",
      route: "via Paota and Riktiya Bheruji Circle",
      isArrival: false,
    });
    
    // More schedules would be added here...
  }
}

// Decide which storage to use
export const storage = process.env.NODE_ENV === "production" 
  ? new MongoStorage() 
  : new MemStorage();

// Seed initial data on startup
storage.seedInitialData().catch(console.error);
