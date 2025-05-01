import { db } from '../../db';
import { users, medicalRecords } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Mock the database
jest.mock('../../db', () => ({
  db: {
    query: {
      users: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      medicalRecords: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
}));

describe('Patients API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('should fetch all patients', async () => {
      // Mock implementation for this test
      (db.query.users.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          username: 'patient1',
          email: 'patient1@example.com',
          fullName: 'Patient One',
          role: 'patient',
          avatarUrl: null,
          specialization: null,
        },
        {
          id: 2,
          username: 'patient2',
          email: 'patient2@example.com',
          fullName: 'Patient Two',
          role: 'patient',
          avatarUrl: null,
          specialization: null,
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/patients');
      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.query.users.findMany).toHaveBeenCalled();
      expect(data.length).toBe(2);
      expect(data[0].username).toBe('patient1');
      expect(data[1].username).toBe('patient2');
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should fetch a single patient by ID', async () => {
      // Mock implementation for this test
      (db.query.users.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 1,
        username: 'patient1',
        email: 'patient1@example.com',
        fullName: 'Patient One',
        role: 'patient',
        avatarUrl: null,
        specialization: null,
      });

      // Simulate the API call with fetch
      const response = await fetch('/api/patients/1');
      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.query.users.findFirst).toHaveBeenCalled();
      expect(data.username).toBe('patient1');
    });

    it('should return 404 for non-existent patient', async () => {
      // Mock implementation for this test
      (db.query.users.findFirst as jest.Mock).mockResolvedValueOnce(null);

      // Simulate the API call with fetch
      const response = await fetch('/api/patients/999');

      // Expectations
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/patients/:id/medical-records', () => {
    it('should fetch medical records for a patient', async () => {
      // Mock implementation for this test
      (db.query.medicalRecords.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          patientId: 1,
          appointmentId: 1,
          doctorId: 3,
          diagnosis: 'Common Cold',
          prescription: JSON.stringify([{ name: 'Paracetamol', dosage: '500mg' }]),
          notes: 'Rest and drink plenty of fluids',
          vitalSigns: JSON.stringify([{ name: 'Temperature', value: '38.5', unit: '°C' }]),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/patients/1/medical-records');
      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.query.medicalRecords.findMany).toHaveBeenCalled();
      expect(data.length).toBe(1);
      expect(data[0].diagnosis).toBe('Common Cold');
    });
  });
});