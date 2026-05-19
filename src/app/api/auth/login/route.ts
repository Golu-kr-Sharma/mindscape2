import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import { signAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const users = db.collection('users');
  const user = await users.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const passwordMatches = await compare(password, user.password as string);
  if (!passwordMatches) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const safeUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || null,
  };

  const accessToken = signAuthToken({
    sub: safeUser.id,
    email: safeUser.email,
    name: safeUser.name,
  });

  return NextResponse.json({ user: safeUser, accessToken });
}
