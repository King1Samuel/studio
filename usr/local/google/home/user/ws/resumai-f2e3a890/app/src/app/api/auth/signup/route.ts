
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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userId = newUser._id.toString();
    
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

    return NextResponse.json({ success: true, message: 'User created successfully.', customToken }, { status: 201 });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
