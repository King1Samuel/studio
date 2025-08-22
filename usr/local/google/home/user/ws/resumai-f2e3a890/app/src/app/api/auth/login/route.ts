
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbconnect';
import User from '@/models/User';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    // Use the user's MongoDB ID (_id) as the unique identifier for Firebase
    const userId = user._id.toString();
    
    // Create a session cookie for server-side authentication
    const sessionCookie = await adminAuth.createSessionCookie(userId, { expiresIn: 60 * 60 * 24 * 5 * 1000 }); // 5 days
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 5,
      path: '/',
    });
    
    // Create a custom token for client-side Firebase sign-in
    const customToken = await adminAuth.createCustomToken(userId);

    return NextResponse.json({ success: true, message: 'Login successful.', customToken }, { status: 200 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
