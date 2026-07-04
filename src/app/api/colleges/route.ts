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

function getSearchVariations(search: string): string[] {
  const trimmed = search.trim().toLowerCase();
  if (!trimmed) return [];

  const variations = new Set<string>();
  variations.add(trimmed);

  // Replace spaces with %
  variations.add(trimmed.replace(/\s+/g, '%'));

  // Contiguous alphanumeric version
  const cleanContiguous = trimmed.replace(/[^a-z0-9]/g, '');
  if (cleanContiguous && cleanContiguous !== trimmed) {
    variations.add(cleanContiguous);
  }

  // Split into words and process acronyms
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    // Variation 1: Split words of length <= 3 into letters separated by %
    const processedWords3 = words.map(w => {
      if (w.length <= 3 && /^[a-z0-9]+$/.test(w)) {
        return w.split('').join('%');
      }
      return w;
    });
    variations.add(processedWords3.join('%'));

    // Variation 2: Split words of length <= 4
    const processedWords4 = words.map(w => {
      if (w.length <= 4 && /^[a-z0-9]+$/.test(w)) {
        return w.split('').join('%');
      }
      return w;
    });
    variations.add(processedWords4.join('%'));
  }

  return Array.from(variations);
}

function getConsecutiveAcronymRegex(query: string): string | null {
  const letters = query.trim().replace(/[^a-zA-Z]/g, '').split('');
  if (letters.length < 2 || letters.length > 6) return null;
  const separator = '(?:\\s+(?:of|and|&|the|-)\\s+|\\s+)';
  return '\\m' + letters.map(l => `${l}[a-zA-Z]*`).join(separator);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const district = searchParams.get('district') || '';
    const type = searchParams.get('type') || '';
    const isAutonomous = searchParams.get('isAutonomous');
    const hasHostel = searchParams.get('hasHostel');
    const branch = searchParams.get('branch') || '';
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Log search query for analytics
    if (search.trim() !== '' && offset === 0) {
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
      if (search) {
        const acronymRegex = getConsecutiveAcronymRegex(search);
        
        // Construct dynamic raw SQL query for Step 1
        let selectClause = `SELECT DISTINCT c.code, 
          (CASE 
            WHEN c.code = $1 THEN 1000
            WHEN c.name ILIKE $2 THEN 900
            WHEN c.name ILIKE $3 THEN 800
            WHEN $4::text IS NOT NULL AND c.name ~* $4::text THEN 750
            WHEN c.name ILIKE $5 THEN 700
            WHEN c.name ILIKE $6 THEN 500
            ELSE 0
          END) as relevance,
          c.views,
          c."nirfRank",
          c.name`;
          
        let fromClause = ` FROM "College" c`;
        
        // Join CollegeCourse if branch is filtered
        if (branch && branch !== 'ALL') {
          fromClause += ` JOIN "CollegeCourse" cc ON c.code = cc."collegeCode"`;
        }
        
        let whereClauses = [];
        let params: any[] = [
          search, // $1
          search, // $2
          `${search}%`, // $3
          acronymRegex, // $4
          `% ${search}%`, // $5
          `%${search}%`, // $6
        ];
        
        whereClauses.push(`(c.code = $1 OR c.name ILIKE $6 OR ($4::text IS NOT NULL AND c.name ~* $4::text))`);
        
        let paramIndex = 7;
        
        if (district && district !== 'ALL') {
          params.push(district);
          whereClauses.push(`c.district = $${paramIndex++}`);
        }
        
        if (type && type !== 'ALL') {
          params.push(type);
          whereClauses.push(`c.type = $${paramIndex++}`);
        }
        
        if (isAutonomous !== null && isAutonomous !== 'ALL') {
          params.push(isAutonomous === 'true');
          whereClauses.push(`c."isAutonomous" = $${paramIndex++}`);
        }
        
        if (hasHostel !== null && hasHostel !== 'ALL') {
          params.push(hasHostel === 'true');
          whereClauses.push(`c."hasHostel" = $${paramIndex++}`);
        }
        
        if (branch && branch !== 'ALL') {
          params.push(branch);
          whereClauses.push(`cc."courseCode" = $${paramIndex++}`);
        }
        
        let whereClause = ` WHERE ${whereClauses.join(' AND ')}`;
        
        params.push(limit);
        const limitParam = `$${paramIndex++}`;
        params.push(offset);
        const offsetParam = `$${paramIndex++}`;
        
        const orderByClause = ` ORDER BY relevance DESC, c.views DESC, c."nirfRank" ASC NULLS LAST, c.name ASC`;
        const queryText = `${selectClause}${fromClause}${whereClause}${orderByClause} LIMIT ${limitParam} OFFSET ${offsetParam}`;
        
        const matchedRows: any[] = await prisma.$queryRawUnsafe(queryText, ...params);
        
        if (matchedRows.length > 0) {
          const matchedCodes = matchedRows.map(r => r.code);
          const detailedColleges = await prisma.college.findMany({
            where: {
              code: { in: matchedCodes }
            },
            include: {
              choices: {
                include: {
                  course: true
                }
              }
            }
          });
          
          // Sort to match raw query relevance order
          const codeOrderMap = new Map(matchedCodes.map((code, idx) => [code, idx]));
          colleges = detailedColleges.sort((a, b) => {
            const indexA = codeOrderMap.get(a.code) ?? 99999;
            const indexB = codeOrderMap.get(b.code) ?? 99999;
            return indexA - indexB;
          });
        }
      } else {
        const where: any = {};
        
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
          take: limit,
          skip: offset,
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
      }

      if (colleges.length === 0 && offset === 0) {
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
        const variations = getSearchVariations(search);
        filteredMocks = filteredMocks.filter(c => {
          return variations.some(v => {
            const regexStr = v.replace(/%/g, '.*');
            const regex = new RegExp(regexStr, 'i');
            return regex.test(c.name) || 
                   regex.test(c.code) || 
                   (c.district && regex.test(c.district)) || 
                   (c.city && regex.test(c.city));
          });
        });
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

      const slicedMocks = filteredMocks.slice(offset, offset + limit);
      return NextResponse.json({ success: true, isDemo: true, colleges: slicedMocks });
    }

    return NextResponse.json({ success: true, colleges });
  } catch (error: any) {
    console.error('Colleges query API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
