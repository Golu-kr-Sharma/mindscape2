import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hash } from 'bcryptjs';
import { signAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const users = db.collection('users');

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already in use.' }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);
  const now = new Date();

  const result = await users.insertOne({
    name,
    email,
    password: hashedPassword,
    avatar: null,
    createdAt: now,
    updatedAt: now,
  });

  const user = {
    id: result.insertedId.toString(),
    name,
    email,
    avatar: null,
  };

  const accessToken = signAuthToken({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  return NextResponse.json({ user, accessToken });
}
