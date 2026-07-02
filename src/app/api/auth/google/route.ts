import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'Credential token is required' }, { status: 400 });
    }

    // Verify token with Google's token info API
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!googleRes.ok) {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 400 });
    }

    const payload = await googleRes.json();
    const email = payload.email?.toLowerCase();
    const name = payload.name || payload.given_name || 'Google User';

    if (!email) {
      return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Check if this is the first user (we can auto-promote first user to ADMIN for easy testing, or check domain)
      const userCount = await prisma.user.count();
      const role = (userCount === 0 || email === 'admin@cappilot.com') ? 'ADMIN' : 'USER';

      // Register new user with default candidate profile values
      user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: 'google-oauth-placeholder', // Placeholder
          percentile: 95.0, // Default profile value
          category: 'OPEN',
          gender: 'MALE',
          homeUniversity: 'State Level',
          isTfws: false,
          isPwd: false,
          isDefense: false,
          role,
        },
      });
    }

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
      role: user.role,
    };

    await setSession(sessionUser);

    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    console.error('Google Sign-In API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
