import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { 
  loginSchema, 
  insertUserSchema, 
  insertBusLocationSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Create a memory store for session
const SessionStore = MemoryStore(session);

// Helper function to handle Zod validation
function validateSchema(schema: any, data: any) {
  try {
    return { data: schema.parse(data), error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: fromZodError(error).message };
    }
    return { data: null, error: "Invalid input data" };
  }
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Role-based authorization middleware
function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new SessionStore({
      checkPeriod: 86400000 // 24 hours
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "bus-tracking-app-secret"
  }));
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    const { data, error } = validateSchema(loginSchema, req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    try {
      const { username, password } = data;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Store user in session (exclude password)
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        busId: user.busId
      };
      
      return res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        busId: user.busId
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    // Validate request body
    const { data, error } = validateSchema(
      insertUserSchema.extend({
        password: insertUserSchema.shape.password.min(6, "Password must be at least 6 characters"),
        role: insertUserSchema.shape.role.default("student")
      }), 
      req.body
    );
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    try {
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      
      // Create user
      const user = await storage.createUser(data);
      
      // Return user without password
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        busId: user.busId
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    return res.status(200).json(req.session.user);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // User routes
  app.get("/api/users", requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Remove passwords from the response
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        busId: user.busId
      }));
      
      return res.status(200).json(sanitizedUsers);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes
  app.post("/api/admin/create-driver", requireRole(["admin"]), async (req, res) => {
    // Validate request body with driver-specific requirements
    const { data, error } = validateSchema(
      insertUserSchema.extend({
        role: insertUserSchema.shape.role.default("driver"),
        busId: insertUserSchema.shape.busId.refine(val => val === 1 || val === 2, "Bus ID must be either 1 or 2")
      }),
      req.body
    );
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    try {
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      
      // Create driver user
      const user = await storage.createUser({
        ...data,
        role: "driver" // Ensure role is driver
      });
      
      // Return user without password
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        busId: user.busId
      });
    } catch (error) {
      console.error("Create driver error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Bus routes
  app.get("/api/buses", requireAuth, async (req, res) => {
    try {
      const buses = await storage.getBuses();
      return res.status(200).json(buses);
    } catch (error) {
      console.error("Get buses error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/buses/:id", requireAuth, async (req, res) => {
    try {
      const bus = await storage.getBus(req.params.id);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      return res.status(200).json(bus);
    } catch (error) {
      console.error("Get bus error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Driver routes
  app.post("/api/driver/update-location", requireRole(["driver"]), async (req, res) => {
    // Ensure the driver has an associated bus
    if (!req.session.user.busId) {
      return res.status(400).json({ message: "No bus assigned to the driver" });
    }
    
    // Validate request body
    const { data, error } = validateSchema(insertBusLocationSchema, {
      ...req.body,
      busId: req.session.user.busId
    });
    
    if (error) {
      return res.status(400).json({ message: error });
    }
    
    try {
      // Get the bus
      const bus = await storage.getBusById(req.session.user.busId);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Update bus location
      await storage.updateBusLocation(
        bus.id.toString(), 
        data.latitude, 
        data.longitude
      );
      
      // Store location history
      await storage.createBusLocation({
        busId: bus.id,
        latitude: data.latitude,
        longitude: data.longitude,
        isActive: true
      });
      
      return res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Update location error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/driver/toggle-status", requireRole(["driver"]), async (req, res) => {
    // Ensure the driver has an associated bus
    if (!req.session.user.busId) {
      return res.status(400).json({ message: "No bus assigned to the driver" });
    }
    
    try {
      // Get the bus
      const bus = await storage.getBusById(req.session.user.busId);
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Toggle the active status
      const isActive = req.body.isActive === undefined ? !bus.isActive : !!req.body.isActive;
      await storage.updateBusStatus(bus.id.toString(), isActive);
      
      return res.status(200).json({ message: `Bus ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error("Toggle status error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Schedule routes
  app.get("/api/schedules", requireAuth, async (req, res) => {
    try {
      const day = req.query.day as string || "weekday";
      const busId = req.query.busId as string;
      
      const schedules = await storage.getSchedules(day, busId);
      return res.status(200).json(schedules);
    } catch (error) {
      console.error("Get schedules error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  return httpServer;
}
