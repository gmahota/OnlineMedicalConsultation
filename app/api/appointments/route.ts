import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { insertAppointmentSchema } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || undefined;
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;
    const status = searchParams.get('status') || undefined;
    const isDoctor = searchParams.get('isDoctor') === 'true';
    const isPatient = searchParams.get('isPatient') === 'true';
    
    const appointments = await storage.getAppointments({
      date: date as string | undefined,
      userId,
      status: status as string | undefined,
      isDoctor,
      isPatient
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ message: 'Error fetching appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = insertAppointmentSchema.parse(body);
    
    // Create new appointment
    const newAppointment = await storage.createAppointment(validatedData);
    
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating appointment' }, { status: 500 });
  }
}