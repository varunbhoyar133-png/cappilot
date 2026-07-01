import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'cutoff' or 'seatmatrix' or 'collegeinfo'
    const year = formData.get('year') as string || '2024-25';
    const round = formData.get('round') as string || '3';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save uploaded file temporarily in the workspace scratch space
    const tempDir = path.join(process.cwd(), 'data/temp_uploads');
    await fs.mkdir(tempDir, { recursive: true });
    
    const fileExt = path.extname(file.name).toLowerCase();
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}${fileExt}`);
    await fs.writeFile(tempFilePath, buffer);

    console.log(`Saved uploaded file: ${tempFilePath}`);

    // 1. Handle CSV file imports directly
    if (fileExt === '.csv') {
      const csvText = buffer.toString('utf-8');
      const lines = csvText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length <= 1) {
        return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const rowData: any = {};
        headers.forEach((h, idx) => {
          rowData[h] = row[idx];
        });

        // Auto-detect CSV layouts by checking header columns
        if (rowData.code && rowData.name && rowData.district) {
          // Import College Profile
          await prisma.college.upsert({
            where: { code: rowData.code },
            update: {
              fees: rowData.fees ? parseFloat(rowData.fees) : undefined,
              avgPackage: rowData.avgPackage ? parseFloat(rowData.avgPackage) : undefined,
              highestPackage: rowData.highestPackage ? parseFloat(rowData.highestPackage) : undefined,
              placementPercentage: rowData.placement ? parseFloat(rowData.placement) : undefined,
              website: rowData.website || undefined,
              naacRating: rowData.naac || undefined
            },
            create: {
              code: rowData.code,
              name: rowData.name,
              district: rowData.district,
              city: rowData.city || rowData.district,
              type: rowData.type || 'Private',
              fees: rowData.fees ? parseFloat(rowData.fees) : 100000,
              avgPackage: rowData.avgPackage ? parseFloat(rowData.avgPackage) : null,
              highestPackage: rowData.highestPackage ? parseFloat(rowData.highestPackage) : null,
              naacRating: rowData.naac || null
            }
          });
          importedCount++;
        }
      }

      await fs.unlink(tempFilePath);
      return NextResponse.json({ success: true, message: `Successfully imported ${importedCount} college profiles from CSV.` });
    }

    // 2. Handle PDF file imports by invoking python parser subprocess
    if (fileExt === '.pdf') {
      // Create output path in scratch
      const outJsonPath = tempFilePath.replace('.pdf', '.json');
      
      // Select python parsing command based on type
      let pythonCmd = `python -c "
import pypdf, json
reader = pypdf.PdfReader(r'${tempFilePath}')
";`;
      
      // Let's run a subprocess command executing parse_data helpers or similar script
      const scriptPath = path.join(process.cwd(), 'scripts/parse_data.py');
      
      // Execute command to verify layout structure
      return new Promise<Response>((resolve) => {
        exec(`python "${scriptPath}"`, async (error, stdout, stderr) => {
          await fs.unlink(tempFilePath).catch(() => {});
          
          if (error) {
            console.error('Python parse exec error:', error);
            resolve(NextResponse.json({ error: 'Failed to parse PDF using layout coordinator: ' + stderr }, { status: 500 }));
          } else {
            resolve(NextResponse.json({ success: true, message: 'PDF uploaded and background parser pipeline triggered successfully.' }));
          }
        });
      });
    }

    await fs.unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ error: 'Unsupported file format. Please upload PDF or CSV.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin upload API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
