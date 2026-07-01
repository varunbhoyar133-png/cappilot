import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favourites = await prisma.favourite.findMany({
      where: { userId: session.id },
      include: {
        choice: {
          include: {
            college: true,
            course: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, favourites: favourites.map(f => f.choice) });
  } catch (error: any) {
    console.error('Get favourites error:', error);
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
    const { choiceCode } = body;

    if (!choiceCode) {
      return NextResponse.json({ error: 'Choice code is required' }, { status: 400 });
    }

    // Check if choiceCode is already a favourite
    const existing = await prisma.favourite.findUnique({
      where: {
        userId_choiceCode: {
          userId: session.id,
          choiceCode
        }
      }
    });

    if (existing) {
      // Remove from favourites
      await prisma.favourite.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, added: false });
    } else {
      // Add to favourites
      await prisma.favourite.create({
        data: {
          userId: session.id,
          choiceCode
        }
      });
      return NextResponse.json({ success: true, added: true });
    }
  } catch (error: any) {
    console.error('Toggle favourite error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
