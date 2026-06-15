import { NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const result = await getAiProvider().parseAudienceFromNaturalLanguage(prompt || '');
  return NextResponse.json(result);
}
