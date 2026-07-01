import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const MOCK_COLLEGE_DETAILS: { [code: string]: any } = {
  '03012': {
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
      {
        choiceCode: '0301224210',
        courseCode: '2421',
        status: 'Government Autonomous',
        homeUniversity: 'State Level',
        sanctionedIntake: 60,
        msSeats: 60,
        ewsSeats: 6,
        tfwsSeats: 3,
        course: { name: 'Computer Science & Engineering' },
        cutoffs: [
          { year: '2024-25', round: 1, category: 'GOPENS', percentile: 99.9142, meritRank: 124, stage: 'I' },
          { year: '2024-25', round: 2, category: 'GOPENS', percentile: 99.8841, meritRank: 165, stage: 'I' },
          { year: '2024-25', round: 3, category: 'GOPENS', percentile: 99.8242, meritRank: 201, stage: 'I' },
          { year: '2023-24', round: 1, category: 'GOPENS', percentile: 99.8924, meritRank: 142, stage: 'I' },
          { year: '2023-24', round: 2, category: 'GOPENS', percentile: 99.8512, meritRank: 189, stage: 'I' },
          { year: '2023-24', round: 3, category: 'GOPENS', percentile: 99.7891, meritRank: 245, stage: 'I' },
          { year: '2022-2023', round: 1, category: 'GOPENS', percentile: 99.9015, meritRank: 130, stage: 'I' },
          { year: '2022-2023', round: 2, category: 'GOPENS', percentile: 99.8450, meritRank: 198, stage: 'I' },
          { year: '2022-2023', round: 3, category: 'GOPENS', percentile: 99.8012, meritRank: 220, stage: 'I' }
        ]
      },
      {
        choiceCode: '0301224610',
        courseCode: '2461',
        status: 'Government Autonomous',
        homeUniversity: 'State Level',
        sanctionedIntake: 60,
        msSeats: 60,
        ewsSeats: 6,
        tfwsSeats: 3,
        course: { name: 'Information Technology' },
        cutoffs: [
          { year: '2024-25', round: 1, category: 'GOPENS', percentile: 99.5210, meritRank: 420, stage: 'I' },
          { year: '2024-25', round: 2, category: 'GOPENS', percentile: 99.4124, meritRank: 504, stage: 'I' },
          { year: '2024-25', round: 3, category: 'GOPENS', percentile: 99.2412, meritRank: 648, stage: 'I' },
          { year: '2023-24', round: 1, category: 'GOPENS', percentile: 99.4215, meritRank: 489, stage: 'I' },
          { year: '2023-24', round: 2, category: 'GOPENS', percentile: 99.3012, meritRank: 588, stage: 'I' },
          { year: '2023-24', round: 3, category: 'GOPENS', percentile: 99.1841, meritRank: 704, stage: 'I' }
        ]
      }
    ]
  },
  '06006': {
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
      {
        choiceCode: '0600624210',
        courseCode: '2421',
        status: 'Government Autonomous',
        homeUniversity: 'State Level',
        sanctionedIntake: 60,
        msSeats: 60,
        ewsSeats: 6,
        tfwsSeats: 3,
        course: { name: 'Computer Science & Engineering' },
        cutoffs: [
          { year: '2024-25', round: 1, category: 'GOPENS', percentile: 99.7215, meritRank: 240, stage: 'I' },
          { year: '2024-25', round: 2, category: 'GOPENS', percentile: 99.6410, meritRank: 312, stage: 'I' },
          { year: '2024-25', round: 3, category: 'GOPENS', percentile: 99.4210, meritRank: 421, stage: 'I' }
        ]
      }
    ]
  },
  '06271': {
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
      {
        choiceCode: '0627124210',
        courseCode: '2421',
        status: 'Un-Aided',
        homeUniversity: 'State Level',
        sanctionedIntake: 120,
        msSeats: 120,
        ewsSeats: 12,
        tfwsSeats: 6,
        course: { name: 'Computer Science & Engineering' },
        cutoffs: [
          { year: '2024-25', round: 1, category: 'GOPENS', percentile: 99.1242, meritRank: 780, stage: 'I' },
          { year: '2024-25', round: 2, category: 'GOPENS', percentile: 98.9810, meritRank: 910, stage: 'I' },
          { year: '2024-25', round: 3, category: 'GOPENS', percentile: 98.6012, meritRank: 1104, stage: 'I' }
        ]
      }
    ]
  },
  '06273': {
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
      {
        choiceCode: '0627324210',
        courseCode: '2421',
        status: 'Un-Aided Autonomous',
        homeUniversity: 'State Level',
        sanctionedIntake: 180,
        msSeats: 180,
        ewsSeats: 18,
        tfwsSeats: 9,
        course: { name: 'Computer Science & Engineering' },
        cutoffs: [
          { year: '2024-25', round: 1, category: 'GOPENS', percentile: 97.2104, meritRank: 2450, stage: 'I' },
          { year: '2024-25', round: 2, category: 'GOPENS', percentile: 96.9015, meritRank: 2901, stage: 'I' },
          { year: '2024-25', round: 3, category: 'GOPENS', percentile: 96.5012, meritRank: 3302, stage: 'I' }
        ]
      }
    ]
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let college = null;
    let isDemoMode = false;

    // Track click view
    try {
      college = await prisma.college.findUnique({
        where: { code: id },
        include: {
          choices: {
            include: {
              course: true,
              cutoffs: {
                where: {
                  category: {
                    in: [
                      'GOPENS', 'GOPENH', 'GOPENO',
                      'LOPENS', 'LOPENH', 'LOPENO',
                      'EWS', 'TFWS',
                      'GSCS', 'GSCH', 'GSCO',
                      'GOBCO', 'GOBCH', 'GOBCS'
                    ]
                  }
                }
              }
            }
          }
        }
      });

      if (college) {
        await prisma.college.update({
          where: { code: id },
          data: { views: { increment: 1 } }
        });
        
        await prisma.collegeClick.create({
          data: { collegeCode: id }
        });
      } else {
        isDemoMode = true;
      }
    } catch (dbError) {
      console.warn("Database connection issue, fetching from mock details folder:", dbError);
      isDemoMode = true;
    }

    if (isDemoMode) {
      const mockCollege = MOCK_COLLEGE_DETAILS[id];
      if (!mockCollege) {
        return NextResponse.json({ error: 'College details not found in directory' }, { status: 404 });
      }
      return NextResponse.json({ success: true, isDemo: true, college: mockCollege });
    }

    return NextResponse.json({ success: true, college });
  } catch (error: any) {
    console.error('College detail API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
