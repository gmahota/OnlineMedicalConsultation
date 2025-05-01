import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    }
    
    const patient = await storage.getUserById(id);
    
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    
    // Make sure the patient is actually a patient
    if (patient.role !== 'patient') {
      return NextResponse.json({ message: 'User is not a patient' }, { status: 400 });
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error(`Error fetching patient with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching patient' }, { status: 500 });
  }
}