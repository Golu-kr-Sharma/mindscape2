import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import { signAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    const email =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    const password =
      typeof body.password === 'string'
        ? body.password
        : '';

    // Validate fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required.',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectToDatabase();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed.',
        },
        { status: 500 }
      );
    }

    // Users collection
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password.',
        },
        { status: 401 }
      );
    }

    // Check password exists
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'User password not found.',
        },
        { status: 500 }
      );
    }

    // Compare password
    const passwordMatches = await compare(
      password,
      user.password as string
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password.',
        },
        { status: 401 }
      );
    }

    // Safe user object
    const safeUser = {
      id: user._id.toString(),
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || null,
    };

    // Generate JWT token
    const accessToken = signAuthToken({
      sub: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
    });

    // Success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful.',
        user: safeUser,
        accessToken,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Internal server error.',
      },
      { status: 500 }
    );
  }
}