import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Use the session pooler URL (aws-1-ap-southeast-2.pooler.supabase.com) on port 5432
// since the direct hostname requires IPv6, which may not be supported on this network.
const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to determine district and region from name/code or default
function getDistrict(collegeName: string): { district: string; city: string; region: string } {
  const name = collegeName.toLowerCase();
  let district = "Mumbai";
  let city = "Mumbai";
  let region = "Mumbai";

  if (name.includes("pune") || name.includes("dy patil") || name.includes("sinhgad") || name.includes("mit") || name.includes("pvg")) {
    district = "Pune";
    city = "Pune";
    region = "Pune";
  } else if (name.includes("nagpur") || name.includes("ycc") || name.includes("ramdeobaba")) {
    district = "Nagpur";
    city = "Nagpur";
    region = "Nagpur";
  } else if (name.includes("amravati") || name.includes("sgbau")) {
    district = "Amravati";
    city = "Amravati";
    region = "Amravati";
  } else if (name.includes("aurangabad") || name.includes("sambhajinagar") || name.includes("bamu") || name.includes("geca")) {
    district = "Chhatrapati Sambhajinagar";
    city = "Chhatrapati Sambhajinagar";
    region = "Marathwada";
  } else if (name.includes("nasik") || name.includes("nashik") || name.includes("kkw")) {
    district = "Nashik";
    city = "Nashik";
    region = "Nashik";
  } else if (name.includes("sangli") || name.includes("walchand")) {
    district = "Sangli";
    city = "Sangli";
    region = "Western Maharashtra";
  } else if (name.includes("kolhapur") || name.includes("sanjeevan") || name.includes("dkte")) {
    district = "Kolhapur";
    city = "Kolhapur";
    region = "Western Maharashtra";
  } else if (name.includes("karad") || name.includes("satara")) {
    district = "Satara";
    city = "Karad";
    region = "Western Maharashtra";
  } else if (name.includes("mumbai") || name.includes("vjti") || name.includes("ict") || name.includes("spit") || name.includes("somaiya")) {
    district = "Mumbai";
    city = "Mumbai";
    region = "Mumbai";
  } else if (name.includes("navi mumbai") || name.includes("fr. agnel") || name.includes("pillai")) {
    district = "Thane";
    city = "Navi Mumbai";
    region = "Konkan";
  } else if (name.includes("thane")) {
    district = "Thane";
    city = "Thane";
    region = "Konkan";
  }
  
  return { district, city, region };
}

// Generate premium mock details for prominent colleges
function getPremiumCollegeStats(code: string, name: string): any {
  const normName = name.toLowerCase();
  
  if (code === "06006" || normName.includes("coep") || normName.includes("college of engineering, pune")) {
    return {
      type: "Government",
      isAutonomous: true,
      fees: 135000,
      avgPackage: 11.2,
      highestPackage: 44.0,
      medianPackage: 9.5,
      placementPercentage: 92.5,
      hasHostel: true,
      hostelFees: 40000,
      website: "https://www.coep.org.in",
      naacRating: "A++",
      nbaAccredited: true,
      nirfRank: 73,
      googleMapsUrl: "https://maps.google.com/?q=COEP+Pune"
    };
  }
  if (code === "03012" || normName.includes("vjti") || normName.includes("veermata jijabai technological institute")) {
    return {
      type: "Government",
      isAutonomous: true,
      fees: 85000,
      avgPackage: 12.8,
      highestPackage: 57.0,
      medianPackage: 10.5,
      placementPercentage: 95.2,
      hasHostel: true,
      hostelFees: 35000,
      website: "https://vjti.ac.in",
      naacRating: "A+",
      nbaAccredited: true,
      nirfRank: 82,
      googleMapsUrl: "https://maps.google.com/?q=VJTI+Mumbai"
    };
  }
  if (normName.includes("institute of chemical technology") || code === "03002") {
    return {
      type: "Government",
      isAutonomous: true,
      fees: 90000,
      avgPackage: 10.5,
      highestPackage: 38.0,
      medianPackage: 8.5,
      placementPercentage: 90.0,
      hasHostel: true,
      hostelFees: 45000,
      website: "https://www.ictmumbai.edu.in",
      naacRating: "A++",
      nbaAccredited: true,
      nirfRank: 24,
      googleMapsUrl: "https://maps.google.com/?q=ICT+Mumbai"
    };
  }
  if (normName.includes("sardar patel institute") || code === "03199") {
    return {
      type: "Private",
      isAutonomous: true,
      fees: 172000,
      avgPackage: 11.5,
      highestPackage: 42.0,
      medianPackage: 9.8,
      placementPercentage: 94.0,
      hasHostel: false,
      website: "https://www.spit.ac.in",
      naacRating: "A+",
      nbaAccredited: true,
      nirfRank: 125,
      googleMapsUrl: "https://maps.google.com/?q=SPIT+Mumbai"
    };
  }
  if (normName.includes("pune institute of computer technology") || code === "06271") {
    return {
      type: "Private",
      isAutonomous: false,
      fees: 125000,
      avgPackage: 12.0,
      highestPackage: 45.0,
      medianPackage: 10.0,
      placementPercentage: 96.0,
      hasHostel: true,
      hostelFees: 75000,
      website: "https://pict.edu",
      naacRating: "A",
      nbaAccredited: true,
      nirfRank: 150,
      googleMapsUrl: "https://maps.google.com/?q=PICT+Pune"
    };
  }
  
  const isAuto = normName.includes("autonomous") || normName.includes("deemed") || code.startsWith("01") || code.startsWith("02") || code.startsWith("03");
  const isGovt = normName.includes("government") || normName.includes("university department") || normName.includes("gec");
  
  let fees = 120000;
  if (isGovt) fees = 65000;
  else if (isAuto) fees = 150000;

  const avgPackage = isGovt ? 5.2 : isAuto ? 5.8 : 4.2;
  const highestPackage = isGovt ? 18.0 : isAuto ? 22.0 : 12.0;
  const medianPackage = avgPackage * 0.85;
  const placementPercentage = isGovt ? 78.0 : isAuto ? 82.0 : 70.0;
  const rating = isGovt ? "A+" : isAuto ? "A" : "B++";

  return {
    type: isGovt ? "Government" : normName.includes("aided") ? "Government Aided" : "Private",
    isAutonomous: isAuto,
    fees,
    avgPackage,
    highestPackage,
    medianPackage,
    placementPercentage,
    hasHostel: true,
    hostelFees: 50000,
    website: `http://www.college-${code}.edu.in`,
    naacRating: rating,
    nbaAccredited: isAuto,
    nirfRank: null,
    googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`
  };
}

async function seed() {
  console.log("Starting DB seeding from parsed JSON files...");
  
  const dataDir = path.join(process.cwd(), 'data/parsed');
  const years = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());
  console.log("Years to seed:", years);
  
  // In-memory collections to prepare bulk inserts
  const collegesMap = new Map<string, any>();
  const coursesMap = new Map<string, any>();
  const choicesMap = new Map<string, any>();
  const cutoffsList: any[] = [];
  const cutoffUniqueness = new Set<string>();
  
  let totalColleges = 0;
  let totalCourses = 0;
  let totalChoices = 0;
  let totalCutoffs = 0;

  for (const year of years) {
    const yearDir = path.join(dataDir, year);
    console.log(`Analyzing year data: ${year}...`);
    
    // 1. Process Seat Matrix
    const smPath = path.join(yearDir, 'seat_matrix.json');
    if (fs.existsSync(smPath)) {
      const seatMatrix = JSON.parse(fs.readFileSync(smPath, 'utf8'));
      
      for (const record of seatMatrix) {
        const {
          college_code, college_name, choice_code, course_name,
          sanctioned_intake, ms_seats, minority_seats, all_india_seats,
          institute_seats, orphan_seats, ews_seats, tfws_seats, tfws_choice_code
        } = record;
        
        if (!college_code || !choice_code) continue;
        const course_code = choice_code.substring(5, 9);
        
        // Prepare College Profile
        if (!collegesMap.has(college_code)) {
          const { district, city, region } = getDistrict(college_name);
          const stats = getPremiumCollegeStats(college_code, college_name);
          collegesMap.set(college_code, {
            code: college_code,
            name: college_name,
            type: stats.type,
            isAutonomous: stats.isAutonomous,
            district,
            city,
            fees: stats.fees,
            avgPackage: stats.avgPackage,
            highestPackage: stats.highestPackage,
            medianPackage: stats.medianPackage,
            placementPercentage: stats.placementPercentage,
            hasHostel: stats.hasHostel,
            hostelFees: stats.hostelFees,
            website: stats.website,
            naacRating: stats.naacRating,
            nbaAccredited: stats.nbaAccredited,
            googleMapsUrl: stats.googleMapsUrl,
            nirfRank: stats.nirfRank
          });
        }

        // Prepare Course
        if (!coursesMap.has(course_code)) {
          coursesMap.set(course_code, {
            code: course_code,
            name: course_name || "General Engineering Branch"
          });
        }

        // Prepare CollegeCourse choice
        const stats = getPremiumCollegeStats(college_code, college_name);
        const isMinorityCollege = stats.type === "Private" && (college_name.toLowerCase().includes("minority") || college_name.toLowerCase().includes("hindi") || college_name.toLowerCase().includes("muslim"));
        
        choicesMap.set(choice_code, {
          choiceCode: choice_code,
          collegeCode: college_code,
          courseCode: course_code,
          status: isMinorityCollege ? "Un-Aided Minority" : "Un-Aided Autonomous",
          homeUniversity: college_code.substring(0, 2) === "06" ? "Pune University" : "Mumbai University",
          sanctionedIntake: sanctioned_intake || 0,
          msSeats: ms_seats || 0,
          minoritySeats: minority_seats || 0,
          allIndiaSeats: all_india_seats || 0,
          instituteSeats: institute_seats || 0,
          orphanSeats: orphan_seats || 0,
          ewsSeats: ews_seats || 0,
          tfwsSeats: tfws_seats || 0,
          tfwsChoiceCode: tfws_choice_code || null
        });
      }
    }
    
    // 2. Process Cutoffs
    for (const round of [1, 2, 3]) {
      const coPath = path.join(yearDir, `cutoffs_r${round}.json`);
      if (fs.existsSync(coPath)) {
        const cutoffBlocks = JSON.parse(fs.readFileSync(coPath, 'utf8'));
        
        for (const block of cutoffBlocks) {
          const { choice_code, college, course_name, status, allocations } = block;
          if (!choice_code) continue;
          
          const college_code = choice_code.substring(0, 5);
          const course_code = choice_code.substring(5, 9);
          
          if (!collegesMap.has(college_code) && college) {
            const { district, city, region } = getDistrict(college.name);
            const stats = getPremiumCollegeStats(college_code, college.name);
            collegesMap.set(college_code, {
              code: college_code,
              name: college.name,
              type: stats.type,
              isAutonomous: stats.isAutonomous,
              district,
              city,
              fees: stats.fees,
              avgPackage: stats.avgPackage,
              highestPackage: stats.highestPackage,
              medianPackage: stats.medianPackage,
              placementPercentage: stats.placementPercentage,
              hasHostel: stats.hasHostel,
              hostelFees: stats.hostelFees,
              website: stats.website,
              naacRating: stats.naacRating,
              nbaAccredited: stats.nbaAccredited,
              googleMapsUrl: stats.googleMapsUrl,
              nirfRank: stats.nirfRank
            });
          }
          
          if (!coursesMap.has(course_code)) {
            coursesMap.set(course_code, {
              code: course_code,
              name: course_name || "General Engineering Branch"
            });
          }
          
          if (!choicesMap.has(choice_code)) {
            choicesMap.set(choice_code, {
              choiceCode: choice_code,
              collegeCode: college_code,
              courseCode: course_code,
              status: status || "Un-Aided",
              homeUniversity: "State Level"
            });
          }
          
          for (const alloc of allocations) {
            const { name: allocName, cutoffs: cutoffList } = alloc;
            
            for (const cut of cutoffList) {
              const { category, rank, percentile, stage } = cut;
              if (!category || !rank || percentile === null || percentile === undefined) continue;
              
              // Validate uniqueness to prevent constraint violations
              const uniqueKey = `${choice_code}_${year}_${round}_${category}_${stage || 'I'}`;
              if (!cutoffUniqueness.has(uniqueKey)) {
                cutoffUniqueness.add(uniqueKey);
                cutoffsList.push({
                  choiceCode: choice_code,
                  year,
                  round,
                  category,
                  meritRank: rank,
                  percentile: percentile,
                  stage: stage || "I"
                });
              }
            }
          }
        }
      }
    }
  }

  // 3. Execute bulk inserts in dependency order
  console.log("\nExecuting bulk inserts to database...");
  
  console.log(`- Upserting ${collegesMap.size} Colleges...`);
  await prisma.college.createMany({
    data: Array.from(collegesMap.values()),
    skipDuplicates: true
  });
  totalColleges = collegesMap.size;

  console.log(`- Upserting ${coursesMap.size} Courses...`);
  await prisma.course.createMany({
    data: Array.from(coursesMap.values()),
    skipDuplicates: true
  });
  totalCourses = coursesMap.size;

  console.log(`- Upserting ${choicesMap.size} College Course Choices...`);
  await prisma.collegeCourse.createMany({
    data: Array.from(choicesMap.values()),
    skipDuplicates: true
  });
  totalChoices = choicesMap.size;

  // Insert cutoffs in chunks of 5000 to prevent payload size limits
  console.log(`- Seeding ${cutoffsList.length} Cutoff entries (using chunked queries)...`);
  const chunkSize = 5000;
  for (let i = 0; i < cutoffsList.length; i += chunkSize) {
    const chunk = cutoffsList.slice(i, i + chunkSize);
    await prisma.cutoff.createMany({
      data: chunk,
      skipDuplicates: true
    });
    totalCutoffs += chunk.length;
  }

  console.log(`\nSeeding completed successfully!`);
  console.log(`Total database entries successfully synchronized:`);
  console.log(`- Colleges: ${totalColleges}`);
  console.log(`- Courses: ${totalCourses}`);
  console.log(`- College Course Choices: ${totalChoices}`);
  console.log(`- Cutoff Marks: ${totalCutoffs}`);
}

seed()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
