import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      percentile,
      category,
      gender,
      homeUniversity,
      isTfws,
      isPwd,
      isDefense,
    } = body;

    if (!email || !password || !name || percentile === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Restrict public registration for admin account
    if (email.toLowerCase() === 'admin@cappilot.com') {
      return NextResponse.json(
        { error: 'Registration is restricted for this email address' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        percentile: parseFloat(percentile),
        category: category || 'OPEN',
        gender: gender || 'MALE',
        homeUniversity: homeUniversity || 'State Level',
        isTfws: !!isTfws,
        isPwd: !!isPwd,
        isDefense: !!isDefense,
      },
    });

    // Create session cookie
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
