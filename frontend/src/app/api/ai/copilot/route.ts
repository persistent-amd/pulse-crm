import { NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai';

export async function POST(request: Request) {
  const { prompt, context } = await request.json();
  const result = await getAiProvider().answerCopilot(prompt, context ?? {});
  return NextResponse.json(result);
}
