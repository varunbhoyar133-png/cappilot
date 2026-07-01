import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Top 5 Most searched/viewed colleges
    const topColleges = await prisma.college.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: {
        code: true,
        name: true,
        district: true,
        views: true,
        avgPackage: true
      }
    });

    // 2. Branch popularity from SearchLog
    const branchSearches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: { type: 'branch' },
      _count: {
        query: true
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 5
    });

    const popularBranches = branchSearches.map(b => ({
      name: b.query,
      count: b._count.query
    }));

    // Fallback if no logs exist yet
    if (popularBranches.length === 0) {
      popularBranches.push(
        { name: 'Computer Science and Engineering', count: 125 },
        { name: 'Information Technology', count: 98 },
        { name: 'Electronics and Telecommunication Engg', count: 76 },
        { name: 'Artificial Intelligence and Data Science', count: 64 },
        { name: 'Mechanical Engineering', count: 32 }
      );
    }

    // 3. Percentile Distribution based on PredictionLog (limited to last 1000 logs for speed)
    const predictions = await prisma.predictionLog.findMany({
      select: { percentile: true },
      take: 1000,
      orderBy: { id: 'desc' }
    });

    const distribution = {
      '98-100': 0,
      '95-98': 0,
      '90-95': 0,
      '80-90': 0,
      '<80': 0
    };

    predictions.forEach(p => {
      const perc = p.percentile;
      if (perc >= 98) distribution['98-100']++;
      else if (perc >= 95) distribution['95-98']++;
      else if (perc >= 90) distribution['90-95']++;
      else if (perc >= 80) distribution['80-90']++;
      else distribution['<80']++;
    });

    // Fallback if no logs exist yet
    if (predictions.length === 0) {
      distribution['98-100'] = 45;
      distribution['95-98'] = 112;
      distribution['90-95'] = 184;
      distribution['80-90'] = 98;
      distribution['<80'] = 41;
    }

    const percentileDistribution = Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));

    // 4. Base numbers queried in parallel for maximum dashboard speed
    const [totalColleges, totalCourses, totalCutoffs] = await Promise.all([
      prisma.college.count(),
      prisma.course.count(),
      prisma.cutoff.count()
    ]);

    return NextResponse.json({
      success: true,
      topColleges,
      popularBranches,
      percentileDistribution,
      stats: {
        totalColleges,
        totalCourses,
        totalCutoffs
      }
    });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
