import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User model for both patients and doctors
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("patient"), // "patient" or "doctor"
  specialization: text("specialization"), // For doctors only
  dateOfBirth: timestamp("date_of_birth"), // For patients only
  gender: text("gender"), // For patients only
  address: text("address"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  doctorAppointments: many(appointments, { relationName: "doctor_appointments" }),
  patientAppointments: many(appointments, { relationName: "patient_appointments" }),
  patientRecords: many(medicalRecords, { relationName: "patient_records" }),
  doctorRecords: many(medicalRecords, { relationName: "doctor_records" }),
}));

// Appointments model
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // In minutes
  title: text("title").notNull(),
  type: text("type").notNull().default("follow-up"), // "new-patient", "follow-up", "annual", "urgent"
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled", "completed"
  consultationMode: text("consultation_mode").notNull().default("video"), // "video" or "in-person"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointmentRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
    relationName: "patient_appointments"
  }),
  doctor: one(users, {
    fields: [appointments.doctorId],
    references: [users.id],
    relationName: "doctor_appointments"
  }),
  medicalRecord: one(medicalRecords, {
    fields: [appointments.id],
    references: [medicalRecords.appointmentId]
  })
}));

// Medical records model
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  vitals: jsonb("vitals"), // JSON with BP, HR, Temp, SpO2, etc.
  prescriptions: jsonb("prescriptions"), // Array of medications
  followUpPlan: text("follow_up_plan"),
  documentUrls: jsonb("document_urls"), // Array of document URLs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const medicalRecordRelations = relations(medicalRecords, ({ one }) => ({
  patient: one(users, {
    fields: [medicalRecords.patientId],
    references: [users.id],
    relationName: "patient_records"
  }),
  doctor: one(users, {
    fields: [medicalRecords.doctorId],
    references: [users.id],
    relationName: "doctor_records"
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id]
  })
}));

// Zod schemas for input validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords);
export const selectMedicalRecordSchema = createSelectSchema(medicalRecords);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;
