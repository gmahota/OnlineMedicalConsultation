import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { insertUserSchema } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body against schema
    const validatedData = insertUserSchema.parse(body);
    
    // Check if username already exists
    const existingUsers = await storage.db
      .select()
      .from(storage.users)
      .where(storage.eq(storage.users.username, validatedData.username));
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }
    
    // Check if email already exists
    const existingEmails = await storage.db
      .select()
      .from(storage.users)
      .where(storage.eq(storage.users.email, validatedData.email));
    
    if (existingEmails.length > 0) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    
    // Create user
    const newUser = await storage.createUser(validatedData);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'Error during registration' }, { status: 500 });
  }
}