import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MOCK_COLLEGES = [
  {
    code: '03012',
    name: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    type: 'Government',
    isAutonomous: true,
    minorityType: null,
    district: 'Mumbai',
    city: 'Mumbai',
    fees: 85000,
    avgPackage: 12.8,
    highestPackage: 57.0,
    medianPackage: 10.5,
    placementPercentage: 95.2,
    hasHostel: true,
    hostelFees: 35000,
    website: 'https://vjti.ac.in',
    naacRating: 'A+',
    nbaAccredited: true,
    nirfRank: 82,
    views: 824,
    choices: [
      { choiceCode: '0301224210', course: { name: 'Computer Science & Engineering' }, courseCode: '2421' },
      { choiceCode: '0301224610', course: { name: 'Information Technology' }, courseCode: '2461' }
    ]
  },
  {
    code: '06006',
    name: 'COEP Technological University, Pune',
    type: 'Government',
    isAutonomous: true,
    minorityType: null,
    district: 'Pune',
    city: 'Pune',
    fees: 135000,
    avgPackage: 11.2,
    highestPackage: 44.0,
    medianPackage: 9.5,
    placementPercentage: 92.5,
    hasHostel: true,
    hostelFees: 40000,
    website: 'https://www.coep.org.in',
    naacRating: 'A++',
    nbaAccredited: true,
    nirfRank: 73,
    views: 765,
    choices: [
      { choiceCode: '0600624210', course: { name: 'Computer Science & Engineering' }, courseCode: '2421' }
    ]
  },
  {
    code: '06271',
    name: 'Pune Institute of Computer Technology (PICT), Pune',
    type: 'Private',
    isAutonomous: false,
    minorityType: null,
    district: 'Pune',
    city: 'Pune',
    fees: 125000,
    avgPackage: 12.0,
    highestPackage: 45.0,
    medianPackage: 10.0,
    placementPercentage: 96.0,
    hasHostel: true,
    hostelFees: 75000,
    website: 'https://pict.edu',
    naacRating: 'A',
    nbaAccredited: true,
    nirfRank: 150,
    views: 654,
    choices: [
      { choiceCode: '0627124210', course: { name: 'Computer Science & Engineering' }, courseCode: '2421' },
      { choiceCode: '0627124610', course: { name: 'Information Technology' }, courseCode: '2461' }
    ]
  },
  {
    code: '03199',
    name: 'Sardar Patel Institute of Technology (SPIT), Mumbai',
    type: 'Private',
    isAutonomous: true,
    minorityType: null,
    district: 'Mumbai',
    city: 'Mumbai',
    fees: 172000,
    avgPackage: 11.5,
    highestPackage: 42.0,
    medianPackage: 9.8,
    placementPercentage: 94.0,
    hasHostel: false,
    website: 'https://www.spit.ac.in',
    naacRating: 'A+',
    nbaAccredited: true,
    nirfRank: 125,
    views: 543,
    choices: [
      { choiceCode: '0319924210', course: { name: 'Computer Science & Engineering' }, courseCode: '2421' }
    ]
  },
  {
    code: '06273',
    name: 'Vishwakarma Institute of Technology (VIT), Pune',
    type: 'Private',
    isAutonomous: true,
    minorityType: null,
    district: 'Pune',
    city: 'Pune',
    fees: 190000,
    avgPackage: 7.8,
    highestPackage: 33.0,
    medianPackage: 6.8,
    placementPercentage: 88.0,
    hasHostel: true,
    hostelFees: 120000,
    website: 'https://www.vit.edu',
    naacRating: 'A++',
    nbaAccredited: true,
    nirfRank: 160,
    views: 421,
    choices: [
      { choiceCode: '0627324210', course: { name: 'Computer Science & Engineering' }, courseCode: '2421' },
      { choiceCode: '0627324610', course: { name: 'Information Technology' }, courseCode: '2461' },
      { choiceCode: '0627337210', course: { name: 'Electronics & Telecommunication' }, courseCode: '3721' }
    ]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const district = searchParams.get('district') || '';
    const type = searchParams.get('type') || '';
    const isAutonomous = searchParams.get('isAutonomous');
    const hasHostel = searchParams.get('hasHostel');
    const branch = searchParams.get('branch') || '';
    
    // Log search query for analytics
    if (search.trim() !== '') {
      try {
        await prisma.searchLog.create({
          data: {
            query: search,
            type: branch ? 'branch' : 'college'
          }
        });
      } catch (e) {}
    }

    let colleges: any[] = [];
    let isDemoMode = false;

    try {
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { district: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (district && district !== 'ALL') {
        where.district = district;
      }
      
      if (type && type !== 'ALL') {
        where.type = type;
      }
      
      if (isAutonomous !== null && isAutonomous !== 'ALL') {
        where.isAutonomous = isAutonomous === 'true';
      }
      
      if (hasHostel !== null && hasHostel !== 'ALL') {
        where.hasHostel = hasHostel === 'true';
      }

      if (branch && branch !== 'ALL') {
        where.choices = {
          some: {
            courseCode: branch
          }
        };
      }

      colleges = await prisma.college.findMany({
        where,
        take: 50, // Limit results to top 50 matches for maximum response speed
        include: {
          choices: {
            include: {
              course: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { nirfRank: { sort: 'asc', nulls: 'last' as any } }
        ]
      });

      if (colleges.length === 0) {
        isDemoMode = true;
      }
    } catch (dbError) {
      console.warn("Database connection issue, returning mock colleges directory:", dbError);
      isDemoMode = true;
    }

    if (isDemoMode) {
      // Apply filters to mocks
      let filteredMocks = [...MOCK_COLLEGES];
      
      if (search) {
        const q = search.toLowerCase();
        filteredMocks = filteredMocks.filter(c => c.name.toLowerCase().includes(q) || c.code.includes(q));
      }
      if (district && district !== 'ALL') {
        filteredMocks = filteredMocks.filter(c => c.district.toLowerCase() === district.toLowerCase());
      }
      if (type && type !== 'ALL') {
        filteredMocks = filteredMocks.filter(c => c.type.toLowerCase() === type.toLowerCase());
      }
      if (isAutonomous !== null && isAutonomous !== 'ALL') {
        const autoBool = isAutonomous === 'true';
        filteredMocks = filteredMocks.filter(c => c.isAutonomous === autoBool);
      }
      if (hasHostel !== null && hasHostel !== 'ALL') {
        const hostelBool = hasHostel === 'true';
        filteredMocks = filteredMocks.filter(c => c.hasHostel === hostelBool);
      }
      if (branch && branch !== 'ALL') {
        filteredMocks = filteredMocks.filter(c => c.choices.some(ch => ch.courseCode === branch));
      }

      return NextResponse.json({ success: true, isDemo: true, colleges: filteredMocks });
    }

    return NextResponse.json({ success: true, colleges });
  } catch (error: any) {
    console.error('Colleges query API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
