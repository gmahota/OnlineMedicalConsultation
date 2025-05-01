import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { 
  users,
  appointments,
  medicalRecords,
  User,
  NewUser,
  Appointment,
  NewAppointment,
  MedicalRecord,
  NewMedicalRecord
} from '@shared/schema';

// Create a PostgreSQL pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { users, appointments, medicalRecords } });

export const storage = {
  /**
   * Create a new user
   */
  async createUser(userData: NewUser): Promise<User> {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  },
  
  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user || !user.password) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  },
  
  /**
   * Get a user by ID
   */
  async getUserById(id: number): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    
    return user || null;
  },
  
  /**
   * Get all patients (users with role 'patient')
   */
  async getPatients(): Promise<User[]> {
    const patients = await db.query.users.findMany({
      where: eq(users.role, 'patient'),
      orderBy: desc(users.createdAt)
    });
    
    return patients;
  },
  
  /**
   * Get recent patients based on recent appointments
   */
  async getRecentPatients(limit: number = 10): Promise<User[]> {
    // First get recent appointments with unique patient IDs
    const recentAppointments = await db.query.appointments.findMany({
      orderBy: desc(appointments.date),
      limit: 50 // Get more than we need to account for duplicates
    });
    
    // Extract unique patient IDs
    const uniquePatientIds = Array.from(new Set(recentAppointments.map((a: Appointment) => a.patientId)));
    
    // Get patient details for these IDs
    const patients = await Promise.all(
      uniquePatientIds.slice(0, limit).map((id: number) => this.getUserById(id))
    );
    
    // Filter out any nulls
    return patients.filter(p => p !== null) as User[];
  },
  
  /**
   * Get appointments with optional filters
   */
  async getAppointments(filters?: { 
    patientId?: number;
    doctorId?: number;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
    date?: Date | string;
    limit?: number;
  }): Promise<Appointment[]> {
    let query = db.query.appointments;
    
    if (filters) {
      let conditions = [];
      
      if (filters.patientId) {
        // Will extend with patientId condition
      }
      
      if (filters.doctorId) {
        // Will extend with doctorId condition
      }
      
      if (filters.status) {
        // Will extend with status condition
      }
      
      if (filters.date) {
        const dateObj = typeof filters.date === 'string' ? new Date(filters.date) : filters.date;
        // Will extend with date condition
      }
      
      if (filters.limit) {
        // Will apply limit
      }
    }
    
    const result = await query.findMany({
      orderBy: desc(appointments.date)
    });
    
    return result;
  },
  
  /**
   * Get a specific appointment by ID
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id)
    });
    
    return appointment || null;
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
      .set({ status: 'in-progress' })
      .where(eq(appointments.id, id))
      .returning();
    
    return updatedAppointment || null;
  },
  
  /**
   * Update an appointment to completed status
   */
  async endAppointment(id: number): Promise<Appointment | null> {
    const [updatedAppointment] = await db.update(appointments)
      .set({ status: 'completed' })
      .where(eq(appointments.id, id))
      .returning();
    
    return updatedAppointment || null;
  },
  
  /**
   * Get the current active appointment (status = 'in-progress')
   */
  async getActiveAppointment(): Promise<Appointment | null> {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.status, 'in-progress'),
      orderBy: desc(appointments.date)
    });
    
    return appointment || null;
  },
  
  /**
   * Get available time slots for a given date
   */
  async getAvailableTimeSlots(date: string): Promise<string[]> {
    // Define all possible time slots from 8am to 6pm
    const allTimeSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30'
    ];
    
    // Get booked appointments for this date
    const bookedAppointments = await db.query.appointments.findMany({
      where: sql`DATE(${appointments.date}) = DATE(${date})`,
      orderBy: appointments.date
    });
    
    // Filter out the booked time slots
    const bookedTimes = new Set(
      bookedAppointments
        .filter(a => a.status !== 'cancelled')
        .map(a => {
          const appointmentDate = new Date(a.date);
          return `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(appointmentDate.getMinutes()).padStart(2, '0')}`;
        })
    );
    
    return allTimeSlots.filter(time => !bookedTimes.has(time));
  },
  
  /**
   * Get medical records by patient ID with optional filters
   */
  async getMedicalRecordsByPatientId(
    patientId: number,
    filters?: {
      type?: 'consultation' | 'prescription' | 'lab-result' | 'imaging' | 'referral';
      limit?: number;
    }
  ): Promise<MedicalRecord[]> {
    let query = db.query.medicalRecords;
    
    if (filters?.type) {
      // Will extend with type filter
    }
    
    if (filters?.limit) {
      // Will apply limit
    }
    
    const records = await query.findMany({
      orderBy: desc(medicalRecords.createdAt)
    });
    
    return records.filter(record => record.patientId === patientId);
  },
  
  /**
   * Get a medical record by appointment ID
   */
  async getMedicalRecordByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
    const record = await db.query.medicalRecords.findFirst({
      where: eq(medicalRecords.appointmentId, appointmentId)
    });
    
    return record || null;
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
      .set(recordData)
      .where(eq(medicalRecords.id, id))
      .returning();
    
    return updatedRecord || null;
  }
};