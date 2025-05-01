import { db } from "@db";
import { 
  users, 
  appointments, 
  medicalRecords,
  type User,
  type NewUser,
  type Appointment,
  type NewAppointment,
  type MedicalRecord,
  type NewMedicalRecord
} from "@shared/schema";
import { and, asc, between, desc, eq, gte, ilike, inArray, lt, sql } from "drizzle-orm";
import { format, parse, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import moment from 'moment';
import bcrypt from 'bcryptjs';

export const storage = {
  // ===== User Methods =====
  /**
   * Create a new user
   */
  async createUser(userData: NewUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [newUser] = await db.insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning();
    
    return newUser;
  },
  
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) return null;
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) return null;
    
    return user;
  },
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    return db.query.users.findFirst({
      where: eq(users.id, id)
    });
  },
  
  /**
   * Get all patients (users with role 'patient')
   */
  async getPatients(): Promise<User[]> {
    return db.query.users.findMany({
      where: eq(users.role, 'patient'),
      orderBy: asc(users.fullName)
    });
  },
  
  /**
   * Get recent patients based on recent appointments
   */
  async getRecentPatients(limit: number = 10): Promise<User[]> {
    // Get patients with recent appointments
    const recentAppointments = await db.query.appointments.findMany({
      where: lt(appointments.date, new Date()),
      orderBy: desc(appointments.date),
      limit: 20  // Fetch more than needed to ensure unique patients
    });
    
    // Extract unique patient IDs
    const patientIds = [...new Set(recentAppointments.map(a => a.patientId))];
    
    // Fetch patient details
    const patients = await db.query.users.findMany({
      where: and(
        eq(users.role, 'patient'),
        inArray(users.id, patientIds.slice(0, limit))
      )
    });
    
    return patients;
  },
  
  // ===== Appointment Methods =====
  /**
   * Get appointments with optional filtering
   */
  async getAppointments(filters?: { 
    date?: string;
    month?: string;
    status?: string;
    doctorId?: number; 
    patientId?: number;
  }): Promise<Appointment[]> {
    let query = db.select().from(appointments);
    
    if (filters) {
      // Date-based filtering
      if (filters.date) {
        // Convert date string to a SQL date range
        const sql_date = filters.date;
        query = query.where(
          sql`DATE(${appointments.date}) = ${sql_date}`
        );
      } else if (filters.month) {
        const [year, month] = filters.month.split('-').map(Number);
        const month_str = month < 10 ? `0${month}` : `${month}`;
        
        query = query.where(
          sql`EXTRACT(YEAR FROM ${appointments.date}) = ${year} AND EXTRACT(MONTH FROM ${appointments.date}) = ${month}`
        );
      }
      
      // Status filtering
      if (filters.status) {
        query = query.where(eq(appointments.status, filters.status));
      }
      
      // Doctor filtering
      if (filters.doctorId) {
        query = query.where(eq(appointments.doctorId, filters.doctorId));
      }
      
      // Patient filtering
      if (filters.patientId) {
        query = query.where(eq(appointments.patientId, filters.patientId));
      }
    }
    
    // Order by date
    query = query.orderBy(asc(appointments.date));
    
    return query;
  },
  
  /**
   * Get a specific appointment by ID
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    return db.query.appointments.findFirst({
      where: eq(appointments.id, id)
    });
  },
  
  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: NewAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments)
      .values(appointmentData)
      .returning();
    
    return newAppointment;
  },
  
  /**
   * Update an appointment to started status
   */
  async startAppointment(id: number): Promise<Appointment | null> {
    const [updatedAppointment] = await db.update(appointments)
      .set({ 
        status: 'in-progress',
        updatedAt: new Date()
      })
      .where(eq(appointments.id, id))
      .returning();
    
    return updatedAppointment || null;
  },
  
  /**
   * Update an appointment to completed status
   */
  async endAppointment(id: number): Promise<Appointment | null> {
    const [updatedAppointment] = await db.update(appointments)
      .set({ 
        status: 'completed',
        updatedAt: new Date()
      })
      .where(eq(appointments.id, id))
      .returning();
    
    return updatedAppointment || null;
  },
  
  /**
   * Get the current active appointment (status = 'in-progress')
   */
  async getActiveAppointment(): Promise<Appointment | null> {
    return db.query.appointments.findFirst({
      where: eq(appointments.status, 'in-progress')
    });
  },
  
  /**
   * Get available time slots for a given date
   */
  async getAvailableTimeSlots(date: string): Promise<string[]> {
    // Default available slots (9am to 5pm, 30 min intervals)
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    
    try {
      // Get booked appointments for the date
      const bookedAppointments = await this.getAppointments({ date });
      
      // Get booked time slots
      const bookedTimeSlots = bookedAppointments.map(appointment => {
        return moment(appointment.date).format('HH:mm');
      });
      
      // Filter out booked slots
      const availableTimeSlots = allTimeSlots.filter(
        slot => !bookedTimeSlots.includes(slot)
      );
      
      return availableTimeSlots;
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return allTimeSlots; // Return all slots on error
    }
  },
  
  // ===== Medical Record Methods =====
  /**
   * Get medical records for a patient
   */
  async getMedicalRecordsByPatientId(
    patientId: number, 
    options?: { filter?: string; searchQuery?: string }
  ): Promise<MedicalRecord[]> {
    let query = db.select().from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId));
    
    if (options) {
      // Apply filter
      if (options.filter && options.filter !== 'all') {
        switch (options.filter) {
          case 'consultations':
            query = query.where(sql`${medicalRecords.appointmentId} IS NOT NULL`);
            break;
          case 'lab_results':
            query = query.where(ilike(medicalRecords.title, '%lab%'));
            break;
          case 'prescriptions':
            query = query.where(sql`${medicalRecords.prescriptions} IS NOT NULL`);
            break;
        }
      }
      
      // Apply search query
      if (options.searchQuery) {
        query = query.where(
          sql`(
            ${medicalRecords.title} ILIKE ${`%${options.searchQuery}%`} OR
            ${medicalRecords.symptoms} ILIKE ${`%${options.searchQuery}%`} OR
            ${medicalRecords.diagnosis} ILIKE ${`%${options.searchQuery}%`} OR
            ${medicalRecords.notes} ILIKE ${`%${options.searchQuery}%`}
          )`
        );
      }
    }
    
    // Order by creation date (newest first)
    query = query.orderBy(desc(medicalRecords.createdAt));
    
    return query;
  },
  
  /**
   * Get a medical record by appointment ID
   */
  async getMedicalRecordByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
    return db.query.medicalRecords.findFirst({
      where: eq(medicalRecords.appointmentId, appointmentId)
    });
  },
  
  /**
   * Create a new medical record
   */
  async createMedicalRecord(recordData: NewMedicalRecord): Promise<MedicalRecord> {
    const [newRecord] = await db.insert(medicalRecords)
      .values(recordData)
      .returning();
    
    return newRecord;
  },
  
  /**
   * Update an existing medical record
   */
  async updateMedicalRecord(id: number, recordData: NewMedicalRecord): Promise<MedicalRecord | null> {
    const [updatedRecord] = await db.update(medicalRecords)
      .set({ 
        ...recordData,
        updatedAt: new Date()
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    
    return updatedRecord || null;
  }
};
