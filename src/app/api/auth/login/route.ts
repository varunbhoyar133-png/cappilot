import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const hashed = await hashPassword(password);
    if (user.passwordHash !== hashed) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set session cookie
    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      percentile: user.percentile,
      category: user.category,
      gender: user.gender,
      homeUniversity: user.homeUniversity,
      isTfws: user.isTfws,
      isPwd: user.isPwd,
      isDefense: user.isDefense,
    };
    
    await setSession(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
