import type {
  AiProvider,
  CampaignGenerationInput,
  CampaignGenerationOutput,
  CopilotMessage,
  CrmContext,
  OpportunityInsight,
} from './types';

function personaCount(context: CrmContext, persona: string) {
  return context.personaBreakdown?.[persona] ?? (persona === 'Churn Risk' ? 23 : 46);
}

export class MockAiProvider implements AiProvider {
  async generateCampaign(input: CampaignGenerationInput): Promise<CampaignGenerationOutput> {
    const channel = input.channel || 'WhatsApp';
    const audience = input.audienceName || 'high-value shoppers';
    return {
      headline: `${input.goal} campaign for ${audience}`,
      body: `Hi {{customer_name}}, your {{favorite_category}} picks are waiting. We saved {{recommended_product}} with a private incentive for your next order. This offer is timed for shoppers like you and expires this weekend.`,
      cta: 'Claim your private offer',
      recommendedChannel: channel,
      reasoning: `${channel} is recommended because this audience responds best to direct, high-intent messages with category-specific products and a short redemption window.`,
    };
  }

  async improveCopy(input: CampaignGenerationInput): Promise<CampaignGenerationOutput> {
    const base = await this.generateCampaign(input);
    const variants = {
      ctr: {
        headline: 'Add urgency and a single tap CTA',
        body: `${input.message || base.body}\n\nValid for 48 hours only. Tap once to claim before the weekend drop closes.`,
        cta: 'Shop the drop',
      },
      incentive: {
        headline: 'Incentive: category voucher',
        body: `${input.message || base.body}\n\nUse code PULSE200 for Rs.200 off above Rs.1,499 on your favorite category.`,
        cta: 'Use PULSE200',
      },
      tone: {
        headline: 'VIP tone rewrite',
        body: `Hello {{customer_name}}, as one of our valued shoppers, you have early access to {{recommended_product}} from your {{favorite_category}} collection. We would love to welcome you back this week.`,
        cta: 'Explore early access',
      },
      subject: {
        headline: '{{customer_name}}, your private {{favorite_category}} edit is ready',
        body: input.message || base.body,
        cta: 'Open your edit',
      },
      generate: base,
    } as const;
    const variant = variants[input.action] || base;
    return {
      ...base,
      ...variant,
      recommendedChannel: input.channel || base.recommendedChannel,
      reasoning: 'Generated from audience goal, channel, current template, and demo CRM metrics.',
    };
  }

  async generateAudienceInsights(context: CrmContext) {
    return this.generateOpportunityFeed(context);
  }

  async generateOpportunityFeed(context: CrmContext): Promise<OpportunityInsight[]> {
    const churn = personaCount(context, 'Churn Risk');
    return [
      {
        id: 'ai-churn-risk',
        section: 'churn',
        title: `${churn} high-value shoppers are becoming inactive`,
        confidence: 94,
        impact: 'Rs.48,000 expected recovery',
        reasoning: 'These shoppers have multiple prior purchases, high lifetime value, and no recent order activity. A short WhatsApp incentive should recover intent.',
        recommendedAction: 'Create a win-back campaign with a category voucher and 48-hour expiry.',
      },
      {
        id: 'ai-weekend-growth',
        section: 'growth',
        title: 'Weekend shoppers responded 34% better than average',
        confidence: 88,
        impact: '+4.2% projected conversion lift',
        reasoning: 'Weekend Shopper personas show stronger WhatsApp read behavior and faster same-day purchase windows.',
        recommendedAction: 'Schedule Saturday morning WhatsApp campaigns for Fashion and Coffee segments.',
      },
      {
        id: 'ai-cross-sell',
        section: 'campaign',
        title: 'Coffee buyers are ready for brewing gear cross-sell',
        confidence: 82,
        impact: 'Rs.1,50,000 potential upsell',
        reasoning: 'Customers buying Arabica Beans often upgrade to French Press within 20 to 35 days.',
        recommendedAction: 'Launch an email + WhatsApp cross-sell sequence for Coffee buyers.',
      },
      {
        id: 'ai-delhi',
        section: 'persona',
        title: 'Delhi shoppers show unusually high engagement',
        confidence: 79,
        impact: 'Channel expansion opportunity',
        reasoning: 'Delhi customers in the demo data over-index on Electronics and show better click-through on product-led offers.',
        recommendedAction: 'Build a Delhi Electronics audience and test an RCS campaign.',
      },
      {
        id: 'ai-next-best',
        section: 'next',
        title: 'Next best action: import orders, then launch win-back',
        confidence: 91,
        impact: 'Demo flow readiness',
        reasoning: `CRM currently reports ${context.customers ?? 'demo'} customers and ${context.orders ?? 'demo'} orders. Metrics and personas improve after orders are imported.`,
        recommendedAction: 'Use the official sample orders CSV and then create a Churn Risk audience.',
      },
    ];
  }

  async answerCopilot(prompt: string, context: CrmContext): Promise<CopilotMessage> {
    const lower = prompt.toLowerCase();
    if (lower.includes('churn')) {
      return {
        answer: `I found ${personaCount(context, 'Churn Risk')} likely churn-risk shoppers. They have older last purchase dates and enough order history to justify a win-back campaign. Recommended move: WhatsApp, 48-hour incentive, category-specific product.`,
        actions: [
          { label: 'Open Audience Builder', href: '/app/audiences' },
          { label: 'Draft Win-back Campaign', href: '/app/campaigns/new?goal=Win%20Back&channel=WhatsApp' },
        ],
      };
    }
    if (lower.includes('coffee')) {
      return {
        answer: 'Coffee buyers are a strong upsell opportunity. I would target Arabica and Cold Brew buyers with French Press or Mocha Gift Box recommendations and a weekend bundle incentive.',
        actions: [{ label: 'Create Coffee Campaign', href: '/app/campaigns/new?goal=Upsell&channel=Email' }],
      };
    }
    if (lower.includes('highest') || lower.includes('value')) {
      return {
        answer: 'Your highest-value shoppers cluster around Electronics, Beauty, and repeat Coffee purchases. Use LTV >= 10000 and total orders >= 5 for a premium loyalty audience.',
        actions: [{ label: 'Build High LTV Audience', href: '/app/audiences' }],
      };
    }
    return {
      answer: 'I would start by importing customers and orders, then create a Churn Risk or High Value Loyalist audience. From there, launch a WhatsApp-first campaign and watch callbacks in Activity.',
      actions: [
        { label: 'Go to Imports', href: '/app/imports' },
        { label: 'Open AI Insights', href: '/app/insights' },
      ],
    };
  }
}
