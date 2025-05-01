import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Clear existing data
    console.log("Clearing existing data...");
    // We need to delete in a specific order due to foreign key constraints
    await db.delete(schema.medicalRecords);
    await db.delete(schema.appointments);
    await db.delete(schema.users);
    
    // Create sample users (doctors and patients)
    console.log("Creating sample users...");
    
    // Hash password for all users (using the same for simplicity in development)
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Create doctor users
    const doctors = [
      {
        username: "drchen",
        password: hashedPassword,
        email: "drchen@mediconsult.com",
        phone: "+1 (555) 123-4567",
        fullName: "Dr. Sarah Chen",
        role: "doctor",
        specialization: "Cardiologist",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      },
      {
        username: "drpeterson",
        password: hashedPassword,
        email: "drpeterson@mediconsult.com",
        phone: "+1 (555) 234-5678",
        fullName: "Dr. Mark Peterson",
        role: "doctor",
        specialization: "Cardiologist",
        avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      }
    ];
    
    const doctorIds = [];
    for (const doctor of doctors) {
      const [newDoctor] = await db.insert(schema.users).values(doctor).returning();
      doctorIds.push(newDoctor.id);
      console.log(`Created doctor: ${newDoctor.fullName} (ID: ${newDoctor.id})`);
    }
    
    // Create patient users
    const patients = [
      {
        username: "emmawilson",
        password: hashedPassword,
        email: "emma.wilson@example.com",
        phone: "+1 (555) 123-4567",
        fullName: "Emma Wilson",
        role: "patient",
        dateOfBirth: new Date("1991-04-15"),
        gender: "Female",
        address: "123 Main Street, Apt 4B, New York, NY 10001",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      },
      {
        username: "mjohnson",
        password: hashedPassword,
        email: "michael.johnson@example.com",
        phone: "+1 (555) 234-5678",
        fullName: "Michael Johnson",
        role: "patient",
        dateOfBirth: new Date("1978-08-23"),
        gender: "Male",
        address: "456 Oak Avenue, Chicago, IL 60601",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      },
      {
        username: "davidlee",
        password: hashedPassword,
        email: "david.lee@example.com",
        phone: "+1 (555) 345-6789",
        fullName: "David Lee",
        role: "patient",
        dateOfBirth: new Date("1995-11-08"),
        gender: "Male",
        address: "789 Pine Street, San Francisco, CA 94101",
        avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      },
      {
        username: "sgarcia",
        password: hashedPassword,
        email: "sarah.garcia@example.com",
        phone: "+1 (555) 456-7890",
        fullName: "Sarah Garcia",
        role: "patient",
        dateOfBirth: new Date("1985-02-12"),
        gender: "Female",
        address: "1010 Maple Road, Austin, TX 78701",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&w=100&h=100&q=80"
      }
    ];
    
    const patientIds = [];
    for (const patient of patients) {
      const [newPatient] = await db.insert(schema.users).values(patient).returning();
      patientIds.push(newPatient.id);
      console.log(`Created patient: ${newPatient.fullName} (ID: ${newPatient.id})`);
    }
    
    // Create sample appointments
    console.log("\nCreating sample appointments...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startHours = [10, 11, 14, 15];
    const appointmentTypes = ["new-patient", "follow-up", "annual", "urgent"];
    const statuses = ["pending", "confirmed", "completed"];
    
    const doctorId = doctorIds[0]; // Dr. Sarah Chen
    
    // Today's appointments
    for (let i = 0; i < 3; i++) {
      const patientId = patientIds[i];
      const appointmentDate = new Date(today);
      appointmentDate.setHours(startHours[i], 0, 0); // Set to 10:00, 11:00, 14:00
      
      const [appointment] = await db.insert(schema.appointments).values({
        patientId,
        doctorId,
        date: appointmentDate,
        duration: 30,
        title: `${i === 1 ? 'New Patient' : 'Follow-up'} Consultation`,
        type: i === 1 ? 'new-patient' : 'follow-up',
        status: i < 2 ? 'confirmed' : 'pending',
        consultationMode: 'video',
        notes: i === 0 ? 'Blood pressure checkup' : (i === 1 ? 'Initial consultation' : 'Follow-up on previous treatment')
      }).returning();
      
      console.log(`Created appointment: ${appointment.title} at ${appointmentDate.toLocaleTimeString()} (ID: ${appointment.id})`);
    }
    
    // Past appointments for medical history
    // Emma Wilson's past appointments (ID: 1)
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const todayMorning = new Date(today);
    todayMorning.setHours(8, 30, 0);
    
    const lastWeekTime = new Date(lastWeek);
    lastWeekTime.setHours(14, 30, 0);
    
    const lastMonthTime = new Date(lastMonth);
    lastMonthTime.setHours(9, 15, 0);
    
    const pastAppointments = [
      // Today's follow-up (completed)
      {
        patientId: patientIds[0], // Emma Wilson
        doctorId,
        date: todayMorning,
        duration: 30,
        title: "Follow-up: Blood Pressure Check",
        type: "follow-up",
        status: "completed",
        consultationMode: "video",
        notes: "Patient reports occasional dizziness when standing up quickly. Still experiencing mild headaches in the morning."
      },
      // Last week's lab results
      {
        patientId: patientIds[0], // Emma Wilson
        doctorId,
        date: lastWeekTime,
        duration: 30,
        title: "Lab Results Review",
        type: "follow-up",
        status: "completed",
        consultationMode: "video",
        notes: "Review of blood panel results. Kidney function and electrolytes."
      },
      // Initial consultation (last month)
      {
        patientId: patientIds[0], // Emma Wilson
        doctorId: doctorIds[1], // Dr. Mark Peterson
        date: lastMonthTime,
        duration: 45,
        title: "Cardiology Consultation",
        type: "new-patient",
        status: "completed",
        consultationMode: "in-person",
        notes: "Initial assessment for hypertension. Patient reports occasional headaches and dizziness. Family history of hypertension (mother and grandfather)."
      }
    ];
    
    for (const apptData of pastAppointments) {
      const [appointment] = await db.insert(schema.appointments).values(apptData).returning();
      console.log(`Created past appointment: ${appointment.title} (ID: ${appointment.id})`);
      
      // Create corresponding medical record
      const bp = apptData.title.includes("Blood Pressure") ? "138/88 mmHg" : (apptData.title.includes("Cardiology") ? "152/94 mmHg" : "139/90 mmHg");
      const hr = apptData.title.includes("Blood Pressure") ? "78" : (apptData.title.includes("Cardiology") ? "82" : "76");
      
      const vitals = JSON.stringify([
        { label: "BP", value: bp, unit: "mmHg", isElevated: parseInt(bp.split('/')[0]) > 140 },
        { label: "HR", value: hr, unit: "bpm" },
        { label: "Temp", value: "37.0", unit: "°C" },
        { label: "SpO2", value: "98", unit: "%" }
      ]);
      
      // Lab results
      let labResults = null;
      if (apptData.title.includes("Lab")) {
        labResults = JSON.stringify([
          { label: "SODIUM", value: "139", unit: "mmol/L" },
          { label: "POTASSIUM", value: "4.2", unit: "mmol/L" },
          { label: "CREATININE", value: "1.2", unit: "mg/dL", isElevated: true },
          { label: "eGFR", value: "82", unit: "mL/min" }
        ]);
      }
      
      // Medications
      const medications = JSON.stringify([
        {
          id: "med1",
          name: "Lisinopril",
          dosage: apptData.title.includes("Blood Pressure") ? "20mg tablet" : "10mg tablet",
          instructions: "Take 1 tablet by mouth once daily",
          quantity: 30,
          refills: 3
        },
        {
          id: "med2",
          name: "Aspirin",
          dosage: "81mg tablet",
          instructions: "Take 1 tablet by mouth once daily",
          quantity: 30,
          refills: 3
        }
      ]);
      
      const medicalRecord = {
        patientId: apptData.patientId,
        doctorId: apptData.doctorId,
        appointmentId: appointment.id,
        title: apptData.title,
        symptoms: apptData.notes,
        diagnosis: apptData.title.includes("Cardiology") ? "Hypertension (Stage 1)" : "Hypertension (Controlled)",
        notes: apptData.title.includes("Blood Pressure") 
          ? "Patient shows slight improvement from previous visit. Blood pressure remains elevated but lower than initial reading. Continue with current medication regimen but adjust dosage of lisinopril from 10mg to 20mg daily. Recommended lifestyle changes appear to be helping but encouraged further sodium reduction."
          : (apptData.title.includes("Lab") 
            ? "Blood panel done to monitor kidney function and electrolytes. Minor elevation in creatinine levels that bears watching."
            : "Initial assessment shows stage 1 hypertension. Starting patient on lisinopril 10mg daily and aspirin 81mg daily. Recommended lifestyle modifications including reduced sodium intake, regular exercise, and stress management."),
        vitals: apptData.title.includes("Lab") ? labResults : vitals,
        prescriptions: medications,
        followUpPlan: "Schedule follow-up appointment in 4 weeks. Patient to monitor BP at home daily and maintain log.",
        createdAt: new Date()
      };
      
      const [record] = await db.insert(schema.medicalRecords).values(medicalRecord).returning();
      console.log(`Created medical record for appointment ID ${appointment.id}`);
    }
    
    console.log("\nSeeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

seed();
