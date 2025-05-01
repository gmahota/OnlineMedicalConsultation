import { db } from '../../db';
import { appointments } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Mock the database
jest.mock('../../db', () => ({
  db: {
    query: {
      appointments: {
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

describe('Appointments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/appointments', () => {
    it('should fetch appointments with filters', async () => {
      // Mock implementation for this test
      (db.query.appointments.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          title: 'Annual Checkup',
          date: '2025-05-10T09:00:00Z',
          status: 'scheduled',
          patientId: 2,
          doctorId: 1,
          consultationMode: 'video',
          duration: 30,
          type: 'General',
          notes: null,
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/appointments?status=scheduled');
      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.query.appointments.findMany).toHaveBeenCalled();
      expect(data[0].title).toBe('Annual Checkup');
    });
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      // Mock the returning value
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockReturnThis();
      (db.returning as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          title: 'New Appointment',
          date: '2025-05-15T10:00:00Z',
          status: 'scheduled',
          patientId: 2,
          doctorId: 1,
          consultationMode: 'video',
          duration: 30,
          type: 'General',
          notes: 'First time visit',
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Appointment',
          date: '2025-05-15T10:00:00Z',
          patientId: 2,
          doctorId: 1,
          consultationMode: 'video',
          duration: 30,
          type: 'General',
          notes: 'First time visit',
        }),
      });

      const data = await response.json();

      // Expectations
      expect(response.status).toBe(201);
      expect(db.insert).toHaveBeenCalledWith(appointments);
      expect(db.values).toHaveBeenCalled();
      expect(db.returning).toHaveBeenCalled();
      expect(data.title).toBe('New Appointment');
    });

    it('should return 400 for invalid appointment data', async () => {
      // Simulate the API call with fetch
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing required fields
          title: 'New Appointment',
        }),
      });

      // Expectations
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/appointments/:id/start', () => {
    it('should update appointment status to in-progress', async () => {
      // Mock implementation for this test
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.returning as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          title: 'Annual Checkup',
          date: '2025-05-10T09:00:00Z',
          status: 'in-progress',
          patientId: 2,
          doctorId: 1,
          consultationMode: 'video',
          duration: 30,
          type: 'General',
          notes: null,
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/appointments/1/start', {
        method: 'PATCH',
      });

      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.update).toHaveBeenCalledWith(appointments);
      expect(db.set).toHaveBeenCalledWith({ status: 'in-progress' });
      expect(db.where).toHaveBeenCalled();
      expect(data.status).toBe('in-progress');
    });
  });

  describe('PATCH /api/appointments/:id/complete', () => {
    it('should update appointment status to completed', async () => {
      // Mock implementation for this test
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.returning as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          title: 'Annual Checkup',
          date: '2025-05-10T09:00:00Z',
          status: 'completed',
          patientId: 2,
          doctorId: 1,
          consultationMode: 'video',
          duration: 30,
          type: 'General',
          notes: null,
        },
      ]);

      // Simulate the API call with fetch
      const response = await fetch('/api/appointments/1/complete', {
        method: 'PATCH',
      });

      const data = await response.json();

      // Expectations
      expect(response.status).toBe(200);
      expect(db.update).toHaveBeenCalledWith(appointments);
      expect(db.set).toHaveBeenCalledWith({ status: 'completed' });
      expect(db.where).toHaveBeenCalled();
      expect(data.status).toBe('completed');
    });
  });
});