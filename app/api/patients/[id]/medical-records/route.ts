import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = parseInt(params.id);
    
    if (isNaN(patientId)) {
      return NextResponse.json({ message: 'Invalid patient ID' }, { status: 400 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    
    const medicalRecords = await storage.getMedicalRecordsByPatientId(patientId, {
      type: type as string | undefined,
      limit
    });
    
    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error(`Error fetching medical records for patient ${params.id}:`, error);
    return NextResponse.json({ message: 'Error fetching medical records' }, { status: 500 });
  }
}