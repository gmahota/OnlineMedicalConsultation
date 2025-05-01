import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import moment from 'moment';

export async function GET() {
  try {
    const today = moment().format('YYYY-MM-DD');
    const appointments = await storage.getAppointments({
      date: today
    });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return NextResponse.json({ message: 'Error fetching today\'s appointments' }, { status: 500 });
  }
}