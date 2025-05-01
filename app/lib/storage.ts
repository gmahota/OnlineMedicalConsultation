import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import { eq, and, desc, sql, asc, gte } from 'drizzle-orm';

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
} from '@/db/schema';

// Initialize PostgreSQL connection
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { users, appointments, medicalRecords } });

export const storage = {
  /**
   * Create a new user
   */
  async createUser(userData: NewUser): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const newUser = await db.insert(users).values(userData).returning();
    return newUser[0];
  },

  /**
   * Authenticate a user with username and password
   */
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    if (!user.password) {
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
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result.length ? result[0] : null;
  },

  /**
   * Get all patients (users with role 'patient')
   */
  async getPatients(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'patient'));
  },

  /**
   * Get recent patients based on recent appointments
   */
  async getRecentPatients(limit: number = 10): Promise<User[]> {
    // Get patient IDs from recent appointments
    const recentAppointments = await db
      .select({ patientId: appointments.patientId })
      .from(appointments)
      .orderBy(desc(appointments.date))
      .limit(limit);

    const patientIds = [...new Set(recentAppointments.map(a => a.patientId))];

    if (patientIds.length === 0) {
      return [];
    }

    // Get patient details
    const patients = await db
      .select()
      .from(users)
      .where(
        sql`${users.id} IN (${patientIds.join(',')})`
      );

    return patients;
  },

  /**
   * Get appointments with optional filters
   */
  async getAppointments(filters?: { 
    date?: string, 
    userId?: number, 
    status?: string,
    isDoctor?: boolean,
    isPatient?: boolean
  }): Promise<Appointment[]> {
    let query = db
      .select()
      .from(appointments)
      .orderBy(asc(appointments.date));

    if (filters) {
      if (filters.date) {
        const startOfDay = moment(filters.date).startOf('day').toISOString();
        const endOfDay = moment(filters.date).endOf('day').toISOString();
        
        query = query.where(
          and(
            gte(appointments.date, startOfDay),
            sql`${appointments.date} <= ${endOfDay}`
          )
        );
      }

      if (filters.status) {
        query = query.where(eq(appointments.status, filters.status));
      }

      if (filters.userId) {
        if (filters.isDoctor) {
          query = query.where(eq(appointments.doctorId, filters.userId));
        } else if (filters.isPatient) {
          query = query.where(eq(appointments.patientId, filters.userId));
        }
      }
    }

    return await query;
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointmentById(id: number): Promise<Appointment | null> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));

    return result.length ? result[0] : null;
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: NewAppointment): Promise<Appointment> {
    const newAppointment = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();

    return newAppointment[0];
  },

  /**
   * Update an appointment to started status
   */
  async startAppointment(id: number): Promise<Appointment | null> {
    const updatedAppointment = await db
      .update(appointments)
      .set({ status: 'in-progress' })
      .where(eq(appointments.id, id))
      .returning();

    return updatedAppointment.length ? updatedAppointment[0] : null;
  },

  /**
   * Update an appointment to completed status
   */
  async endAppointment(id: number): Promise<Appointment | null> {
    const updatedAppointment = await db
      .update(appointments)
      .set({ status: 'completed' })
      .where(eq(appointments.id, id))
      .returning();

    return updatedAppointment.length ? updatedAppointment[0] : null;
  },

  /**
   * Get the current active appointment (status = 'in-progress')
   */
  async getActiveAppointment(): Promise<Appointment | null> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, 'in-progress'))
      .limit(1);

    return result.length ? result[0] : null;
  },

  /**
   * Get available time slots for a given date
   */
  async getAvailableTimeSlots(date: string): Promise<string[]> {
    const startOfDay = moment(date).startOf('day').toISOString();
    const endOfDay = moment(date).endOf('day').toISOString();

    // Get booked appointments for the date
    const bookedAppointments = await db
      .select({ date: appointments.date, duration: appointments.duration })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, startOfDay),
          sql`${appointments.date} <= ${endOfDay}`
        )
      );

    // Generate time slots from 9 AM to 5 PM in 30-minute intervals
    const timeSlots: string[] = [];
    const slotDuration = 30; // minutes
    const startTime = moment(date).hour(9).minute(0).second(0);
    const endTime = moment(date).hour(17).minute(0).second(0);

    let currentSlot = startTime.clone();
    while (currentSlot.isBefore(endTime)) {
      const slotISOString = currentSlot.toISOString();
      
      // Check if slot is available
      const isBooked = bookedAppointments.some(appt => {
        const apptStart = moment(appt.date);
        const apptEnd = moment(appt.date).add(appt.duration, 'minutes');
        return currentSlot.isSameOrAfter(apptStart) && currentSlot.isBefore(apptEnd);
      });
      
      if (!isBooked) {
        timeSlots.push(slotISOString);
      }
      
      currentSlot.add(slotDuration, 'minutes');
    }

    return timeSlots;
  },

  /**
   * Get medical records by patient ID with optional filters
   */
  async getMedicalRecordsByPatientId(
    patientId: number,
    filters?: { type?: string, limit?: number }
  ): Promise<MedicalRecord[]> {
    let query = db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.createdAt));

    if (filters?.type && filters.type !== 'all') {
      query = query.where(eq(medicalRecords.type, filters.type));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  },

  /**
   * Get a medical record by appointment ID
   */
  async getMedicalRecordByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
    const result = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointmentId, appointmentId));

    return result.length ? result[0] : null;
  },

  /**
   * Create a new medical record
   */
  async createMedicalRecord(recordData: NewMedicalRecord): Promise<MedicalRecord> {
    const newRecord = await db
      .insert(medicalRecords)
      .values(recordData)
      .returning();

    return newRecord[0];
  },

  /**
   * Update an existing medical record
   */
  async updateMedicalRecord(id: number, recordData: NewMedicalRecord): Promise<MedicalRecord | null> {
    const updatedRecord = await db
      .update(medicalRecords)
      .set(recordData)
      .where(eq(medicalRecords.id, id))
      .returning();

    return updatedRecord.length ? updatedRecord[0] : null;
  }
};