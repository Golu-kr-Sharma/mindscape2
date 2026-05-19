import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getAuthToken, verifyAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    const { title } = await request.json();
    const db = await connectToDatabase();
    const sessions = db.collection('chat_sessions');
    const now = new Date();

    const session = {
      userId: payload.sub,
      title: title || 'New Chat',
      createdAt: now,
      updatedAt: now,
    };

    const result = await sessions.insertOne(session);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    const db = await connectToDatabase();
    const sessions = db.collection('chat_sessions');

    const data = await sessions
      .find({ userId: payload.sub })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(
      data.map((item) => ({
        id: item._id.toString(),
        userId: item.userId,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
