import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Map student profile to eligible CET category codes
function getEligibleCategories(profile: {
  category: string;
  gender: string;
  isHomeUniversity: boolean;
  isTfws: boolean;
  isPwd: boolean;
  isDefense: boolean;
}): string[] {
  const suffix = profile.isHomeUniversity ? 'H' : 'O';
  const cats: string[] = [];
  
  if (profile.isTfws) {
    cats.push('TFWS');
  }
  
  const baseCat = profile.category.toUpperCase();
  const isFemale = profile.gender.toUpperCase() === 'FEMALE';
  
  if (profile.isPwd) {
    if (baseCat === 'OPEN') {
      cats.push(`PWDOPEN${suffix}`, 'PWDOPENS');
    } else {
      cats.push(`PWD${baseCat}${suffix}`, `PWD${baseCat}S`, `PWDOPEN${suffix}`, 'PWDOPENS');
    }
  }
  
  if (profile.isDefense) {
    if (baseCat === 'OPEN') {
      cats.push(`DEFOPEN${suffix}`, 'DEFOPENS');
    } else {
      cats.push(`DEF${baseCat}${suffix}`, `DEF${baseCat}S`, `DEFOPEN${suffix}`, 'DEFOPENS');
    }
  }
  
  if (baseCat === 'EWS') {
    cats.push('EWS');
  }
  
  if (baseCat !== 'OPEN' && baseCat !== 'EWS') {
    if (isFemale) {
      cats.push(`L${baseCat}${suffix}`, `L${baseCat}S`);
    }
    cats.push(`G${baseCat}${suffix}`, `G${baseCat}S`);
  }
  
  if (isFemale) {
    cats.push(`LOPEN${suffix}`, 'LOPENS');
  }
  cats.push(`GOPEN${suffix}`, 'GOPENS');
  
  cats.push('MI', 'MINORITY');
  
  return cats;
}

// Generate all possible categories for the user to optimize database queries
function getAllPotentialCategories(profile: {
  category: string;
  gender: string;
  isTfws: boolean;
  isPwd: boolean;
  isDefense: boolean;
}): string[] {
  const suffixes = ['H', 'O', 'S'];
  const cats: string[] = [];
  
  if (profile.isTfws) {
    cats.push('TFWS');
  }
  
  const baseCat = profile.category.toUpperCase();
  const isFemale = profile.gender.toUpperCase() === 'FEMALE';
  
  suffixes.forEach(suffix => {
    if (profile.isPwd) {
      if (baseCat === 'OPEN') {
        cats.push(`PWDOPEN${suffix}`, 'PWDOPENS');
      } else {
        cats.push(`PWD${baseCat}${suffix}`, `PWD${baseCat}S`, `PWDOPEN${suffix}`, 'PWDOPENS');
      }
    }
    
    if (profile.isDefense) {
      if (baseCat === 'OPEN') {
        cats.push(`DEFOPEN${suffix}`, 'DEFOPENS');
      } else {
        cats.push(`DEF${baseCat}${suffix}`, `DEF${baseCat}S`, `DEFOPEN${suffix}`, 'DEFOPENS');
      }
    }
    
    if (baseCat !== 'OPEN' && baseCat !== 'EWS') {
      if (isFemale) {
        cats.push(`L${baseCat}${suffix}`, `L${baseCat}S`);
      }
      cats.push(`G${baseCat}${suffix}`, `G${baseCat}S`);
    }
    
    if (isFemale) {
      cats.push(`LOPEN${suffix}`, 'LOPENS');
    }
    cats.push(`GOPEN${suffix}`, 'GOPENS');
  });
  
  if (baseCat === 'EWS') {
    cats.push('EWS');
  }
  
  cats.push('MI', 'MINORITY');
  
  return Array.from(new Set(cats));
}

// Generate realistic demo fallback predictions if database is not seeded
function generateMockPredictions(
  percentile: number,
  category: string,
  gender: string,
  district: string,
  courseCode: string,
  collegeType: string
) {
  const allMocks = [
    { code: '03012', name: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', type: 'Government', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Mumbai', fees: 85000, avgPackage: 12.8, cutoff: 99.6, placementRate: 95 },
    { code: '03012', name: 'Veermata Jijabai Technological Institute (VJTI), Mumbai', type: 'Government', isAutonomous: true, courseName: 'Information Technology', courseCode: '2461', district: 'Mumbai', fees: 85000, avgPackage: 11.5, cutoff: 99.2, placementRate: 93 },
    { code: '06006', name: 'COEP Technological University, Pune', type: 'Government', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 135000, avgPackage: 11.2, cutoff: 99.4, placementRate: 92 },
    { code: '03199', name: 'Sardar Patel Institute of Technology (SPIT), Mumbai', type: 'Private', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Mumbai', fees: 172000, avgPackage: 11.5, cutoff: 98.8, placementRate: 94 },
    { code: '06271', name: 'Pune Institute of Computer Technology (PICT), Pune', type: 'Private', isAutonomous: false, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 125000, avgPackage: 12.0, cutoff: 98.6, placementRate: 96 },
    { code: '06271', name: 'Pune Institute of Computer Technology (PICT), Pune', type: 'Private', isAutonomous: false, courseName: 'Information Technology', courseCode: '2461', district: 'Pune', fees: 125000, avgPackage: 10.8, cutoff: 98.1, placementRate: 94 },
    { code: '06273', name: 'Vishwakarma Institute of Technology (VIT), Pune', type: 'Private', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 190000, avgPackage: 7.8, cutoff: 96.5, placementRate: 88 },
    { code: '06273', name: 'Vishwakarma Institute of Technology (VIT), Pune', type: 'Private', isAutonomous: true, courseName: 'Information Technology', courseCode: '2461', district: 'Pune', fees: 190000, avgPackage: 7.2, cutoff: 95.8, placementRate: 86 },
    { code: '06273', name: 'Vishwakarma Institute of Technology (VIT), Pune', type: 'Private', isAutonomous: true, courseName: 'Electronics & Telecommunication', courseCode: '3721', district: 'Pune', fees: 190000, avgPackage: 6.5, cutoff: 94.0, placementRate: 82 },
    { code: '06278', name: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune', type: 'Private', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 135000, avgPackage: 6.8, cutoff: 95.5, placementRate: 89 },
    { code: '03110', name: 'Dwarkadas J. Sanghvi College of Engineering, Mumbai', type: 'Private', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Mumbai', fees: 198000, avgPackage: 8.5, cutoff: 97.2, placementRate: 91 },
    { code: '06272', name: 'DY Patil College of Engineering, Akurdi (Pune)', type: 'Private', isAutonomous: false, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 120000, avgPackage: 4.8, cutoff: 93.8, placementRate: 84 },
    { code: '06272', name: 'DY Patil College of Engineering, Akurdi (Pune)', type: 'Private', isAutonomous: false, courseName: 'Information Technology', courseCode: '2461', district: 'Pune', fees: 120000, avgPackage: 4.5, cutoff: 92.5, placementRate: 82 },
    { code: '06175', name: 'Sinhgad College of Engineering, Vadgaon (Pune)', type: 'Private', isAutonomous: false, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Pune', fees: 115050, avgPackage: 4.2, cutoff: 91.0, placementRate: 78 },
    { code: '06122', name: 'Walchand College of Engineering, Sangli', type: 'Government Aided', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Sangli', fees: 85000, avgPackage: 8.5, cutoff: 96.8, placementRate: 89 },
    { code: '04115', name: 'Shri Ramdeobaba College of Engineering, Nagpur', type: 'Private', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Nagpur', fees: 155000, avgPackage: 6.5, cutoff: 95.0, placementRate: 87 },
    { code: '04115', name: 'Shri Ramdeobaba College of Engineering, Nagpur', type: 'Private', isAutonomous: true, courseName: 'Information Technology', courseCode: '2461', district: 'Nagpur', fees: 155000, avgPackage: 6.0, cutoff: 94.2, placementRate: 85 },
    { code: '02008', name: 'Government College of Engineering, Aurangabad', type: 'Government', isAutonomous: true, courseName: 'Computer Science & Engineering', courseCode: '2421', district: 'Chhatrapati Sambhajinagar', fees: 65000, avgPackage: 5.8, cutoff: 95.2, placementRate: 80 }
  ];

  // Adjust mock cutoffs slightly based on category offsets
  const categoryOffset = {
    OPEN: 0,
    OBC: -0.8,
    SC: -4.5,
    ST: -12.0,
    EWS: -0.3
  }[category.toUpperCase()] || 0;

  const predictions: any[] = [];

  for (const mock of allMocks) {
    if (courseCode && courseCode !== 'ALL' && mock.courseCode !== courseCode) continue;
    if (district && district !== 'ALL' && mock.district !== district) continue;
    if (collegeType && collegeType !== 'ALL' && mock.type !== collegeType) continue;

    const adjustedCutoff = Math.max(10, mock.cutoff + categoryOffset);
    const margin = percentile - adjustedCutoff;

    let score = 50;
    if (margin >= 1.5) {
      score = 90 + Math.min(margin * 2, 9);
    } else if (margin >= 0) {
      score = 70 + (margin / 1.5) * 20;
    } else if (margin >= -2.0) {
      score = 40 + ((margin + 2.0) / 2.0) * 30;
    } else if (margin >= -5.0) {
      score = 15 + ((margin + 5.0) / 3.0) * 25;
    } else {
      score = Math.max(5, 15 + (margin + 5.0) * 2);
    }

    if (gender.toUpperCase() === 'FEMALE') score += 1.0;
    score = Math.max(1, Math.min(99, score));

    let status = 'Dream';
    if (score >= 85) {
      status = 'Safe';
    } else if (score >= 55) {
      status = 'Moderate';
    }

    const yearlyCutoffs: { [y: string]: number } = {
      '2024-25': parseFloat(adjustedCutoff.toFixed(4)),
      '2023-24': parseFloat((adjustedCutoff - 0.2).toFixed(4)),
      '2022-2023': parseFloat((adjustedCutoff + 0.1).toFixed(4))
    };

    predictions.push({
      choiceCode: `${mock.code}${mock.courseCode}10`,
      collegeCode: mock.code,
      collegeName: mock.name,
      collegeType: mock.type,
      isAutonomous: mock.isAutonomous,
      courseName: mock.courseName,
      avgCutoff: parseFloat(adjustedCutoff.toFixed(4)),
      yearlyCutoffs,
      studentPercentile: percentile,
      predictionScore: parseFloat(score.toFixed(1)),
      status,
      intake: 60,
      district: mock.district,
      fees: mock.fees,
      avgPackage: mock.avgPackage,
      placementRate: mock.placementRate
    });
  }

  predictions.sort((a, b) => b.predictionScore - a.predictionScore);
  return predictions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      percentile,
      category,
      gender,
      homeUniversity,
      isTfws,
      isPwd,
      isDefense,
      district,
      courseCode,
      collegeType,
      isAutonomous,
      round = 3
    } = body;

    const studentPercentile = parseFloat(percentile);
    if (isNaN(studentPercentile)) {
      return NextResponse.json({ error: 'Valid percentile is required' }, { status: 400 });
    }

    // Write prediction query to logs for analytics (ignore if DB fails)
    try {
      await prisma.predictionLog.create({
        data: {
          percentile: studentPercentile,
          category: category || 'OPEN',
          branch: courseCode || 'ALL',
        }
      });
    } catch (e) {}

    let choices: any[] = [];
    let isDemoMode = false;

    // Pre-calculate all eligible category list to optimize DB load
    const queryCategories = getAllPotentialCategories({
      category: category || 'OPEN',
      gender: gender || 'MALE',
      isTfws: !!isTfws,
      isPwd: !!isPwd,
      isDefense: !!isDefense
    });

    try {
      // Build filter query for CollegeCourses
      const whereClause: any = {};
      
      if (courseCode && courseCode !== 'ALL') {
        whereClause.courseCode = courseCode;
      }
      
      const collegeWhere: any = {};
      if (district && district !== 'ALL') {
        collegeWhere.district = district;
      }
      if (collegeType && collegeType !== 'ALL') {
        collegeWhere.type = collegeType;
      }
      if (isAutonomous !== undefined && isAutonomous !== 'ALL') {
        collegeWhere.isAutonomous = isAutonomous === 'true' || isAutonomous === true;
      }
      
      if (Object.keys(collegeWhere).length > 0) {
        whereClause.college = collegeWhere;
      }

      // Query database with direct category & round filtering at the SQL level (massive optimization!)
      choices = await prisma.collegeCourse.findMany({
        where: whereClause,
        include: {
          college: true,
          course: true,
          cutoffs: {
            where: {
              round: Number(round),
              category: { in: queryCategories }
            }
          }
        }
      });
      
      if (choices.length === 0) {
        isDemoMode = true;
      }
    } catch (dbError) {
      console.warn("Database connection issue, triggering demo mock fallback:", dbError);
      isDemoMode = true;
    }

    if (isDemoMode) {
      const mockPredictions = generateMockPredictions(
        studentPercentile,
        category || 'OPEN',
        gender || 'MALE',
        district || 'ALL',
        courseCode || 'ALL',
        collegeType || 'ALL'
      );
      return NextResponse.json({
        success: true,
        isDemo: true,
        totalPredicted: mockPredictions.length,
        predictions: mockPredictions
      });
    }

    const predictions: any[] = [];

    for (const choice of choices) {
      const isHome = choice.college.district.toLowerCase() === (homeUniversity || '').toLowerCase() || 
                     choice.homeUniversity.toLowerCase().includes((homeUniversity || '').toLowerCase());
      
      const candidateCats = getEligibleCategories({
        category: category || 'OPEN',
        gender: gender || 'MALE',
        isHomeUniversity: isHome,
        isTfws: !!isTfws,
        isPwd: !!isPwd,
        isDefense: !!isDefense
      });

      // Filter local cutoffs in memory (extremely fast since only queried categories exist)
      const eligibleCutoffs = choice.cutoffs.filter((c: any) => candidateCats.includes(c.category));

      const cutoffMap: { [year: string]: number[] } = {};
      
      for (const cutoff of eligibleCutoffs) {
        if (!cutoffMap[cutoff.year]) {
          cutoffMap[cutoff.year] = [];
        }
        cutoffMap[cutoff.year].push(cutoff.percentile);
      }

      // Baseline fallback to GOPENS if no custom eligible category matched
      if (Object.keys(cutoffMap).length === 0) {
        const baseCutoffs = choice.cutoffs.filter((c: any) => c.category === 'GOPENS' || c.category.startsWith('GOPEN'));
        for (const cutoff of baseCutoffs) {
          if (!cutoffMap[cutoff.year]) {
            cutoffMap[cutoff.year] = [];
          }
          cutoffMap[cutoff.year].push(cutoff.percentile);
        }
      }

      const yearlyCutoffs: { [year: string]: number } = {};
      for (const year in cutoffMap) {
        yearlyCutoffs[year] = Math.min(...cutoffMap[year]);
      }

      const yearsList = Object.keys(yearlyCutoffs);
      if (yearsList.length === 0) continue;

      const percentilesList = Object.values(yearlyCutoffs);
      const avgCutoff = percentilesList.reduce((sum, val) => sum + val, 0) / percentilesList.length;
      
      let variation = 1.0;
      if (percentilesList.length > 1) {
        const minVal = Math.min(...percentilesList);
        const maxVal = Math.max(...percentilesList);
        variation = Math.max(maxVal - minVal, 1.0);
      }

      const margin = studentPercentile - avgCutoff;
      
      let score = 50;
      if (margin >= 2.0) {
        score = 90 + Math.min(margin * 2, 9);
      } else if (margin >= 0) {
        score = 70 + (margin / 2.0) * 20;
      } else if (margin >= -2.0) {
        score = 40 + ((margin + 2.0) / 2.0) * 30;
      } else if (margin >= -5.0) {
        score = 15 + ((margin + 5.0) / 3.0) * 25;
      } else {
        score = Math.max(5, 15 + (margin + 5.0) * 2);
      }

      if (isHome) score += 3.0;
      if (Number(round) === 3) score += 2.0;
      if (choice.sanctionedIntake > 120) score += 2.0;
      
      score = Math.max(1, Math.min(99, score));

      let status = 'Dream';
      if (score >= 85) {
        status = 'Safe';
      } else if (score >= 55) {
        status = 'Moderate';
      }

      predictions.push({
        choiceCode: choice.choiceCode,
        collegeCode: choice.collegeCode,
        collegeName: choice.college.name,
        collegeType: choice.college.type,
        isAutonomous: choice.college.isAutonomous,
        courseName: choice.course.name,
        avgCutoff: parseFloat(avgCutoff.toFixed(4)),
        yearlyCutoffs,
        studentPercentile,
        predictionScore: parseFloat(score.toFixed(1)),
        status,
        intake: choice.sanctionedIntake,
        district: choice.college.district,
        fees: choice.college.fees,
        avgPackage: choice.college.avgPackage,
        placementRate: choice.college.placementPercentage
      });
    }

    predictions.sort((a, b) => b.predictionScore - a.predictionScore);

    return NextResponse.json({
      success: true,
      totalPredicted: predictions.length,
      predictions
    });
  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
