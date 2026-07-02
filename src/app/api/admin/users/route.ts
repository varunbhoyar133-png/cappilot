import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.email !== 'admin@cappilot.com' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve stats
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        percentile: true,
        category: true,
        gender: true,
        homeUniversity: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            favourites: true,
            preferenceLists: true,
            chatHistories: true,
          }
        }
      }
    });

    const totalUsers = users.length;
    const searchLogsCount = await prisma.searchLog.count();
    const predictionLogsCount = await prisma.predictionLog.count();
    const chatHistoryCount = await prisma.chatHistory.count();

    // Retrieve recent search logs
    const recentSearches = await prisma.searchLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    // Retrieve recent prediction logs
    const recentPredictions = await prisma.predictionLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        searchLogsCount,
        predictionLogsCount,
        chatHistoryCount
      },
      users,
      recentSearches,
      recentPredictions
    });
  } catch (error: any) {
    console.error('Admin stats retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
