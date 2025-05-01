import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }
    
    const user = await storage.authenticateUser(username, password);
    
    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
    }
    
    // Return user info without sensitive data
    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }, { status: 200 });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ message: 'Error during login' }, { status: 500 });
  }
}