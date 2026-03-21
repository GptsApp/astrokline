import { NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL_NAME = '@cf/google/gemma-3-12b-it';

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const { date, dimension } = await req.json();
    if (!date || !dimension) {
      return NextResponse.json(
        { error: 'Missing date or dimension parameter' },
        { status: 400 }
      );
    }

    // 3. Construct the Astrology Prompt
    const systemPrompt = `You are a Master Astrologer analyzing someone's cosmic weather.
    Tone: Mystical, professional, insightful yet reassuring. Keep it concise (2-3 sentences max).
    Focus: Provide a daily horoscopic reading for the specific dimension: ${dimension}.`;

    const userPrompt = `Date: ${date}. Dimension: ${dimension}. Please give me my reading today with an exact score from 0-100.
    Format your response EXACTLY as a JSON object: {"score": 85, "summary": "Short engaging hook", "details": "The deep 2-3 sentence analysis"}`;

    // 4. Call Cloudflare Workers AI REST API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL_NAME}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare AI Error:', errorText);
      throw new Error(`Cloudflare AI responded with HTTP ${response.status}`);
    }

    const aiData = await response.json();
    const rawResult = aiData?.result?.response || '';

    // 5. Attempt to parse the JSON from the LLM response
    try {
      // Find the JSON boundaries in case the model added conversational filler
      const startIndex = rawResult.indexOf('{');
      const endIndex = rawResult.lastIndexOf('}') + 1;
      const jsonStr = rawResult.slice(startIndex, endIndex);

      const parsed = JSON.parse(jsonStr);
      return NextResponse.json({ success: true, data: parsed });
    } catch (parseError) {
      console.error('Failed to parse LLM JSON:', rawResult);
      return NextResponse.json(
        { error: 'Failed to format astrology data from AI.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
