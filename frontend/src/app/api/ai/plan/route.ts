import { NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai';

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await getAiProvider().planCampaign({
    goal: payload.goal || '',
    notes: payload.notes,
  });
  return NextResponse.json(result);
}
