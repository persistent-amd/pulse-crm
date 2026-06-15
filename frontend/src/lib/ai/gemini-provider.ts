import { MockAiProvider } from './mock-provider';
import type {
  AiProvider,
  CampaignGenerationInput,
  CampaignGenerationOutput,
  CopilotMessage,
  CrmContext,
  OpportunityInsight,
} from './types';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function geminiJson<T>(prompt: string): Promise<T> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY is not configured');
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}') as T;
}

const mock = new MockAiProvider();

export class GeminiAiProvider implements AiProvider {
  async generateCampaign(input: CampaignGenerationInput): Promise<CampaignGenerationOutput> {
    try {
      return await geminiJson<CampaignGenerationOutput>(`
Return strict JSON with keys: headline, body, cta, recommendedChannel, reasoning.
Campaign context: ${JSON.stringify(input)}
Use Pulse CRM shopper engagement language. Keep message body concise. Include dynamic variables like {{customer_name}} and {{favorite_category}} when useful.
`);
    } catch {
      return mock.generateCampaign(input);
    }
  }

  async improveCopy(input: CampaignGenerationInput): Promise<CampaignGenerationOutput> {
    try {
      return await geminiJson<CampaignGenerationOutput>(`
Return strict JSON with keys: headline, body, cta, recommendedChannel, reasoning.
You are improving existing campaign copy. Action requested: ${input.action}
Current message: ${input.message || ''}
Campaign context: ${JSON.stringify({ goal: input.goal, audience: input.audienceName, channel: input.channel })}
`);
    } catch {
      return mock.improveCopy(input);
    }
  }

  async generateOpportunityFeed(context: CrmContext): Promise<OpportunityInsight[]> {
    try {
      return await geminiJson<OpportunityInsight[]>(`
Return JSON array of 5 objects. Each must have keys: id (string), title (string), section (one of: churn, growth, persona, campaign, next), confidence (number 70-98), reasoning (string), recommendedAction (string), impact (string).
CRM context: ${JSON.stringify(context)}
Generate practical retail marketing insights for an Indian D2C brand CRM.
`);
    } catch {
      return mock.generateOpportunityFeed(context);
    }
  }

  async generateAudienceInsights(context: CrmContext): Promise<OpportunityInsight[]> {
    return this.generateOpportunityFeed(context);
  }

  async answerCopilot(prompt: string, context: CrmContext): Promise<CopilotMessage> {
    try {
      return await geminiJson<CopilotMessage>(`
Return strict JSON with keys: answer (string) and actions (array of objects with label and href).
You are a marketing AI copilot for Pulse CRM, a shopper engagement platform.
User asked: ${prompt}
CRM context: ${JSON.stringify(context)}
Keep response practical and action-oriented. Suggest CRM navigation paths like /app/audiences, /app/campaigns/new, /app/insights.
`);
    } catch {
      return mock.answerCopilot(prompt, context);
    }
  }
}
