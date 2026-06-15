export interface CrmContext {
  customers?: number;
  orders?: number;
  audiences?: number;
  personaBreakdown?: Record<string, number>;
  topCities?: string[];
  campaignCount?: number;
}

export interface CampaignGenerationInput {
  goal: string;
  audienceName: string;
  channel: string;
  message?: string;
  action: 'generate' | 'ctr' | 'incentive' | 'tone' | 'subject';
  context?: CrmContext;
}

export interface CampaignGenerationOutput {
  headline: string;
  body: string;
  cta: string;
  recommendedChannel: string;
  reasoning: string;
}

export interface OpportunityInsight {
  id: string;
  title: string;
  section: 'churn' | 'growth' | 'persona' | 'campaign' | 'next';
  confidence: number;
  reasoning: string;
  recommendedAction: string;
  impact: string;
}

export interface CopilotMessage {
  answer: string;
  actions: { label: string; href?: string; action?: string }[];
}

export interface AiProvider {
  generateAudienceInsights(context: CrmContext): Promise<OpportunityInsight[]>;
  generateCampaign(input: CampaignGenerationInput): Promise<CampaignGenerationOutput>;
  improveCopy(input: CampaignGenerationInput): Promise<CampaignGenerationOutput>;
  generateOpportunityFeed(context: CrmContext): Promise<OpportunityInsight[]>;
  answerCopilot(prompt: string, context: CrmContext): Promise<CopilotMessage>;
}
