import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const activeAppointment = await storage.getActiveAppointment();
    
    if (!activeAppointment) {
      return NextResponse.json({ message: 'No active appointment found' }, { status: 404 });
    }
    
    return NextResponse.json(activeAppointment);
  } catch (error) {
    console.error('Error fetching active appointment:', error);
    return NextResponse.json({ message: 'Error fetching active appointment' }, { status: 500 });
  }
}