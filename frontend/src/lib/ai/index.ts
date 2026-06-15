import { GeminiAiProvider } from './gemini-provider';
import { MockAiProvider } from './mock-provider';
import type { AiProvider } from './types';

export function getAiProvider(): AiProvider {
  return process.env.GOOGLE_API_KEY ? new GeminiAiProvider() : new MockAiProvider();
}

export type {
  AiProvider,
  CampaignGenerationInput,
  CampaignGenerationOutput,
  CopilotMessage,
  CrmContext,
  OpportunityInsight,
} from './types';
