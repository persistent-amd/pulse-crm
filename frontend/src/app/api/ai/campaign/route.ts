import { NextResponse } from 'next/server';
import { getAiProvider } from '@/lib/ai';

export async function POST(request: Request) {
  const payload = await request.json();
  const provider = getAiProvider();
  const result = payload.action === 'generate'
    ? await provider.generateCampaign(payload)
    : await provider.improveCopy(payload);
  return NextResponse.json(result);
}
