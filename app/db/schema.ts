import { pgTable, serial, text, integer, timestamp, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["patient", "doctor", "admin"] }).notNull().default("patient"),
  specialization: text("specialization"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  doctorAppointments: many(appointments, { relationName: "doctorAppointments" }),
  patientAppointments: many(appointments, { relationName: "patientAppointments" }),
  medicalRecords: many(medicalRecords),
}));

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: text("type", { enum: ["consultation", "follow-up", "urgent", "routine"] }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["scheduled", "in-progress", "completed", "cancelled"] }).notNull().default("scheduled"),
  consultationMode: text("consultation_mode", { enum: ["video", "in-person", "phone"] }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointmentRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: "patientAppointments"
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
    relationName: "doctorAppointments"
  }),
  medicalRecord: one(medicalRecords, {
    fields: [appointments.id],
    references: [medicalRecords.appointmentId]
  }),
}));

// Medical Records table
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").unique().references(() => appointments.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  type: text("type", { enum: ["consultation", "prescription", "lab-result", "imaging", "referral"] }).notNull(),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  notes: text("notes"),
  vitalSigns: json("vital_signs").$type<Array<{ label: string, value: string, unit: string, isElevated?: boolean }>>(),
  medications: json("medications").$type<Array<{ id: string, name: string, dosage: string, instructions: string, quantity: number, refills: number }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const medicalRecordRelations = relations(medicalRecords, ({ one }) => ({
  patient: one(users, {
    fields: [medicalRecords.patientId],
    references: [users.id]
  }),
  doctor: one(users, {
    fields: [medicalRecords.doctorId],
    references: [users.id]
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id]
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email("Must be a valid email"),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
  fullName: (schema) => schema.min(2, "Name must be at least 2 characters"),
});
export const selectUserSchema = createSelectSchema(users);

export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords);
export const selectMedicalRecordSchema = createSelectSchema(medicalRecords);

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;