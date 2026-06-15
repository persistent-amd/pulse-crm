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

// --- Feature 1: AI Audience Builder ---

export interface AudienceCondition {
  field: 'lifetime_value' | 'total_orders' | 'persona' | 'city' | 'last_purchase_days_ago';
  op: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in' | 'between';
  value: string | number;
}

export interface AudienceFilterOutput {
  conditions: AudienceCondition[];
  audienceName: string;
  audienceDescription: string;
  reasoning: string;
}

// --- Feature 2: AI Campaign Planner ---

export interface CampaignPlanInput {
  goal: string;
  notes?: string;
}

export interface CampaignPlanOutput {
  campaignName: string;
  audienceRecommendation: string;
  channelRecommendation: string;
  headline: string;
  messageBody: string;
  cta: string;
  reasoning: string;
}

export interface AiProvider {
  generateAudienceInsights(context: CrmContext): Promise<OpportunityInsight[]>;
  generateCampaign(input: CampaignGenerationInput): Promise<CampaignGenerationOutput>;
  improveCopy(input: CampaignGenerationInput): Promise<CampaignGenerationOutput>;
  generateOpportunityFeed(context: CrmContext): Promise<OpportunityInsight[]>;
  answerCopilot(prompt: string, context: CrmContext): Promise<CopilotMessage>;
  parseAudienceFromNaturalLanguage(prompt: string): Promise<AudienceFilterOutput>;
  planCampaign(input: CampaignPlanInput): Promise<CampaignPlanOutput>;
}
