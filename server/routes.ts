import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import moment from 'moment';
import { insertAppointmentSchema, insertMedicalRecordSchema, insertUserSchema } from "@shared/schema";

// Structure to store active WebSocket connections
interface SocketConnection {
  socket: WebSocket;
  channelId: string;
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connections: SocketConnection[] = [];
  
  // WebSocket connection handling
  wss.on('connection', (socket, request) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const channelId = url.searchParams.get('channelId') || 'default';
    
    // Add the new connection to our list
    const connection: SocketConnection = { socket, channelId };
    connections.push(connection);
    
    console.log(`WebSocket connected: ${channelId}, total connections: ${connections.length}`);
    
    // Handle incoming messages
    socket.on('message', (messageData) => {
      try {
        const message = JSON.parse(messageData.toString());
        
        // Broadcast to all clients in the same channel
        connections.forEach((conn) => {
          if (conn.channelId === channelId && 
              conn.socket.readyState === WebSocket.OPEN &&
              conn.socket !== socket) {
            conn.socket.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Remove connection when closed
    socket.on('close', () => {
      const index = connections.findIndex(conn => conn.socket === socket);
      if (index !== -1) {
        connections.splice(index, 1);
      }
      console.log(`WebSocket disconnected: ${channelId}, remaining connections: ${connections.length}`);
    });
  });

  // API Routes
  const apiPrefix = '/api';
  
  // ===== Auth Routes =====
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set user in session and return user info
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  });
  
  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Error during logout' });
      }
      
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  // ===== User Routes =====
  app.get(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove sensitive information
      delete user.password;
      
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  });
  
  app.get(`${apiPrefix}/patients`, async (req, res) => {
    try {
      const patients = await storage.getPatients();
      
      // Remove sensitive information
      const sanitizedPatients = patients.map(patient => {
        const { password, ...sanitized } = patient;
        return sanitized;
      });
      
      res.status(200).json(sanitizedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: 'Error fetching patients' });
    }
  });
  
  app.get(`${apiPrefix}/patients/recent`, async (req, res) => {
    try {
      const recentPatients = await storage.getRecentPatients();
      
      // Remove sensitive information
      const sanitizedPatients = recentPatients.map(patient => {
        const { password, ...sanitized } = patient;
        return sanitized;
      });
      
      res.status(200).json(sanitizedPatients);
    } catch (error) {
      console.error('Error fetching recent patients:', error);
      res.status(500).json({ message: 'Error fetching recent patients' });
    }
  });
  
  // ===== Appointment Routes =====
  app.get(`${apiPrefix}/appointments`, async (req, res) => {
    try {
      const month = req.query.month as string;
      const appointments = await storage.getAppointments({ month });
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ message: 'Error fetching appointments' });
    }
  });
  
  app.get(`${apiPrefix}/appointments/today`, async (req, res) => {
    try {
      const todayStr = moment().format('YYYY-MM-DD');
      const appointments = await storage.getAppointments({ date: todayStr });
      res.status(200).json(appointments);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      res.status(500).json({ message: 'Error fetching today\'s appointments' });
    }
  });
  
  app.get(`${apiPrefix}/appointments/active`, async (req, res) => {
    try {
      const activeAppointment = await storage.getActiveAppointment();
      
      if (!activeAppointment) {
        return res.status(404).json({ message: 'No active appointment found' });
      }
      
      res.status(200).json(activeAppointment);
    } catch (error) {
      console.error('Error fetching active appointment:', error);
      res.status(500).json({ message: 'Error fetching active appointment' });
    }
  });
  
  app.get(`${apiPrefix}/appointments/:id`, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const appointment = await storage.getAppointmentById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ message: 'Error fetching appointment' });
    }
  });
  
  app.post(`${apiPrefix}/appointments`, async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating appointment:', error);
      res.status(500).json({ message: 'Error creating appointment' });
    }
  });
  
  app.patch(`${apiPrefix}/appointments/:id/start`, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const appointment = await storage.startAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      console.error('Error starting appointment:', error);
      res.status(500).json({ message: 'Error starting appointment' });
    }
  });
  
  app.patch(`${apiPrefix}/appointments/:id/end`, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const appointment = await storage.endAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      
      res.status(200).json(appointment);
    } catch (error) {
      console.error('Error ending appointment:', error);
      res.status(500).json({ message: 'Error ending appointment' });
    }
  });
  
  app.get(`${apiPrefix}/appointments/time-slots`, async (req, res) => {
    try {
      const date = req.query.date as string;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }
      
      const timeSlots = await storage.getAvailableTimeSlots(date);
      res.status(200).json(timeSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      res.status(500).json({ message: 'Error fetching time slots' });
    }
  });
  
  // ===== Medical Records Routes =====
  app.get(`${apiPrefix}/medical-records/patient/:id`, async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      if (isNaN(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID' });
      }
      
      const filter = req.query.filter as string;
      const searchQuery = req.query.searchQuery as string;
      
      const records = await storage.getMedicalRecordsByPatientId(patientId, { filter, searchQuery });
      res.status(200).json(records);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      res.status(500).json({ message: 'Error fetching medical records' });
    }
  });
  
  app.get(`${apiPrefix}/medical-records/appointment/:id`, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID' });
      }
      
      const record = await storage.getMedicalRecordByAppointmentId(appointmentId);
      
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      
      res.status(200).json(record);
    } catch (error) {
      console.error('Error fetching medical record:', error);
      res.status(500).json({ message: 'Error fetching medical record' });
    }
  });
  
  app.post(`${apiPrefix}/medical-records`, async (req, res) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error creating medical record:', error);
      res.status(500).json({ message: 'Error creating medical record' });
    }
  });
  
  app.patch(`${apiPrefix}/medical-records/:id`, async (req, res) => {
    try {
      const recordId = parseInt(req.params.id);
      
      if (isNaN(recordId)) {
        return res.status(400).json({ message: 'Invalid record ID' });
      }
      
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.updateMedicalRecord(recordId, recordData);
      
      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }
      
      res.status(200).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error('Error updating medical record:', error);
      res.status(500).json({ message: 'Error updating medical record' });
    }
  });

  return httpServer;
}
