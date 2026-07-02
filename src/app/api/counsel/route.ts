import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// A rule-based fallback counsel bot in case Gemini key is missing
function generateCounsellingFallback(
  percentile: number,
  category: string,
  gender: string,
  university: string,
  userMessage: string
): string {
  const msg = userMessage.toLowerCase();
  
  let greeting = `Hello! I'm your MHT CET CAP Counselling Assistant. Here is your profile context:\n- **Percentile:** ${percentile}%\n- **Category:** ${category}\n- **Home University:** ${university}\n- **Gender:** ${gender}\n\n`;

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return greeting + "How can I help you today? You can ask me to:\n1. Suggest best CS/IT colleges for your score.\n2. Compare colleges (e.g. VIT vs Cummins vs PCCOE).\n3. Advise on how to arrange your preference option form.";
  }

  if (msg.includes("cs") || msg.includes("computer") || msg.includes("it") || msg.includes("information technology")) {
    if (percentile >= 98) {
      return greeting + "With a stellar score of **" + percentile + "%**, you have excellent options for CS/IT:\n- **VJTI Mumbai**: High chance of IT, moderate chance of CS.\n- **SPIT Mumbai**: Very high chance of CS/IT.\n- **PICT Pune**: Safe for CS/IT.\n- **COEP Pune**: Highly competitive, but worth placing at the top of your list.\n\n*Advice:* Rank VJTI and COEP as your top choices, followed by SPIT and PICT as secure backups.";
    } else if (percentile >= 95) {
      return greeting + "With a strong score of **" + percentile + "%**, you have great options for CS/IT:\n- **VIT Pune**: Highly realistic (Moderate/Safe).\n- **PCCOE Pune**: High chance (Safe).\n- **Walchand Sangli**: High chance (Safe).\n- **Cummins Pune (for girls)**: Excellent choice (Safe).\n- **VESIT Mumbai**: Safe option.\n\n*Advice:* Keep VIT and Cummins/PCCOE in your top list. Use Walchand as a regional backup.";
    } else if (percentile >= 90) {
      return greeting + "With a solid score of **" + percentile + "%**, you can target these colleges for CS/IT:\n- **DJSCE Mumbai**: Competitive but possible.\n- **TSEC Mumbai**: Moderate option.\n- **DY Patil Akurdi (Pune)**: High chance (Safe).\n- **Sinhgad Vadgaon (Pune)**: Very safe option.\n- **RCOEM Nagpur**: Moderate to safe option.\n\n*Advice:* Put DJSCE and TSEC first, and use DY Patil and Sinhgad as secure backups.";
    } else {
      return greeting + "With a percentile of **" + percentile + "%**, here is my advice for CS/IT:\n- Target autonomous colleges in district centers (like Pune/Mumbai/Nagpur) that have slightly lower cutoff boundaries.\n- Consider allied branches like **AI & Data Science**, **IoT**, or **Cybersecurity** which usually have cutoffs 1.5% to 3% lower than pure Computer Engineering.\n- Target colleges like **MGM Nanded**, **Sanjeevan Kolhapur**, and **JSPM Pune** as realistic options.";
    }
  }

  if (msg.includes("compare") || msg.includes("vs")) {
    if (msg.includes("vit") && msg.includes("cummins")) {
      return greeting + "**VIT Pune vs Cummins Pune Comparison:**\n1. **Placements:** Cummins has an exceptional placement rate (often 92%+) with a median package around 9.5 LPA, primarily due to strong corporate relations and diversity hiring. VIT Pune has a median package around 6.8 LPA.\n2. **Campus & Culture:** VIT Pune is co-ed, extremely lively, and autonomous. Cummins is an all-girls autonomous institute, highly disciplined, and located in Karvenagar.\n3. **Recommendation:** If you are a female student seeking high placements in top-tier product companies, **Cummins** is an outstanding choice. If you prefer a co-ed and vibrant autonomous campus culture, choose **VIT Pune**.";
    }
    return greeting + "To compare colleges, select the **College Comparison Tool** in the dashboard. It will show you side-by-side placements, fees, hostel availability, and cutoff history for up to 3 colleges simultaneously!";
  }

  if (msg.includes("preference") || msg.includes("list") || msg.includes("option form")) {
    return greeting + "**Preference List Strategy:**\n1. Always put your **Dream** colleges (e.g. VJTI, COEP) in the top 10 positions. There is no penalty for placing them first.\n2. Place **Moderate** colleges (e.g. VIT, PICT, PCCOE) in the next 10 positions.\n3. Place at least 5 **Safe** colleges at the bottom to guarantee allotment.\n4. **CRITICAL WARNING:** Never place a college with a lower cutoff *above* one with a higher cutoff if you prefer the higher one. The system allotts sequentially, and you will miss out on the better college!";
  }

  return greeting + "I'm here to help you navigate CAP rounds. You can ask me about branch recommendations, college comparisons, placement data, or counselling advice based on your score!";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, userProfile } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages history is required' }, { status: 400 });
    }

    const lastMessageObj = messages[messages.length - 1];
    const userMessage = lastMessageObj.message || lastMessageObj.content || '';
    const userId = userProfile?.id;

    // Extract student profile data
    const percentile = userProfile?.percentile ? parseFloat(userProfile.percentile) : 95.0;
    const category = userProfile?.category || 'OPEN';
    const gender = userProfile?.gender || 'MALE';
    const university = userProfile?.homeUniversity || 'State Level';

    // Log chat message to database if user is authenticated
    if (userId) {
      try {
        await prisma.chatHistory.create({
          data: {
            userId,
            role: 'user',
            message: userMessage
          }
        });
      } catch (e) {
        console.error('Failed to log chat:', e);
      }
    }

    // Check if Gemini API key is configured
    if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
      try {
        // Initialize Gemini client using the recommended package
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        // Build prompt with rich candidate context
        const systemPrompt = `You are an expert MHT CET CAP admissions counsellor for engineering technical courses in Maharashtra.
Candidate profile:
- MHT CET Percentile: ${percentile}%
- Seat Category: ${category}
- Gender: ${gender}
- Home University: ${university}

Rules:
1. Explain recommendations based on the candidate's percentile.
2. For top options (percentile > 98%), suggest VJTI, COEP, PICT, SPIT.
3. For mid options (94-98%), suggest VIT, PCCOE, Cummins, Walchand, DJSCE, VESIT.
4. Provide structured, concise, and student-friendly advice.
5. Do NOT generate cutoffs or predictions. The candidate already has predictor results. Explain the options, placements, branches, and lists.
6. Footer should include professional advice.`;

        // Clean message history (filter out the initial model greeting to start with a 'user' message)
        let apiMessages = messages;
        if (messages.length > 0 && messages[0].role === 'model') {
          apiMessages = messages.slice(1);
        }

        // Format message history
        const chatContents = apiMessages.map((m: any) => ({
          role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.message || m.content || '' }]
        }));

        // Initialize Gemini model with native systemInstruction support
        const model = ai.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: systemPrompt
        });

        const response = await model.generateContent({
          contents: chatContents
        });

        const replyText = response.response.text() || "I am currently processing your inquiry. Please try again.";

        // Log response
        if (userId) {
          try {
            await prisma.chatHistory.create({
              data: {
                userId,
                role: 'model',
                message: replyText
              }
            });
          } catch (e) {}
        }

        return NextResponse.json({ success: true, message: replyText });
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to rule engine:', geminiError);
        const replyText = generateCounsellingFallback(percentile, category, gender, university, userMessage);
        
        if (userId) {
          try {
            await prisma.chatHistory.create({
              data: {
                userId,
                role: 'model',
                message: replyText
              }
            });
          } catch (e) {}
        }
        return NextResponse.json({ success: true, message: replyText, isFallback: true });
      }
    } else {
      // Use intelligent rule-based fallback if API key is not present
      const replyText = generateCounsellingFallback(percentile, category, gender, university, userMessage);
      
      if (userId) {
        try {
          await prisma.chatHistory.create({
            data: {
              userId,
              role: 'model',
              message: replyText
            }
          });
        } catch (e) {}
      }
      return NextResponse.json({ success: true, message: replyText, isFallback: true });
    }
  } catch (error: any) {
    console.error('Counselling API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
