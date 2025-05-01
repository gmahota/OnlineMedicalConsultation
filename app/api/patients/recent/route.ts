import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    const recentPatients = await storage.getRecentPatients(limit);
    return NextResponse.json(recentPatients);
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    return NextResponse.json({ message: 'Error fetching recent patients' }, { status: 500 });
  }
}