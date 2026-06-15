import { NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai';

export async function POST(request: Request) {
  const context = await request.json();
  const result = await getAiProvider().generateOpportunityFeed(context);
  return NextResponse.json(result);
}
