import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferenceList = await prisma.preferenceList.findFirst({
      where: { userId: session.id },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, preferenceList });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name = "My CAP Option Form", choiceCodes } = body;

    if (!choiceCodes || !Array.isArray(choiceCodes)) {
      return NextResponse.json({ error: 'Invalid choice codes array' }, { status: 400 });
    }

    // Check if user already has a preference list, if so update it, otherwise create a new one
    const existing = await prisma.preferenceList.findFirst({
      where: { userId: session.id }
    });

    let preferenceList;
    if (existing) {
      preferenceList = await prisma.preferenceList.update({
        where: { id: existing.id },
        data: {
          name,
          choiceCodes: choiceCodes
        }
      });
    } else {
      preferenceList = await prisma.preferenceList.create({
        data: {
          userId: session.id,
          name,
          choiceCodes: choiceCodes
        }
      });
    }

    return NextResponse.json({ success: true, preferenceList });
  } catch (error: any) {
    console.error('Save preferences error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
