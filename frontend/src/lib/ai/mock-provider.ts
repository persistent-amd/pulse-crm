import type {
  AiProvider,
  AudienceFilterOutput,
  CampaignGenerationInput,
  CampaignGenerationOutput,
  CampaignPlanInput,
  CampaignPlanOutput,
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

  // --- Feature 1: AI Audience Builder ---
  async parseAudienceFromNaturalLanguage(prompt: string): Promise<AudienceFilterOutput> {
    const lower = prompt.toLowerCase();

    // Pattern: high-value inactive / churn
    if ((lower.includes('spent') || lower.includes('value') || lower.includes('ltv')) && (lower.includes('inactive') || lower.includes('haven') || lower.includes('days') || lower.includes('purchase'))) {
      const amountMatch = lower.match(/(\d[\d,]*)/);
      const daysMatch = lower.match(/(\d+)\s*days/);
      const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 10000;
      const days = daysMatch ? Number(daysMatch[1]) : 45;
      return {
        conditions: [
          { field: 'lifetime_value', op: 'gte', value: amount },
          { field: 'last_purchase_days_ago', op: 'gt', value: days },
        ],
        audienceName: `High Spenders Inactive ${days}+ Days`,
        audienceDescription: `Customers with LTV ≥ ₹${amount.toLocaleString()} who have not purchased in ${days}+ days.`,
        reasoning: `Identified two conditions: a minimum lifetime value threshold of ₹${amount.toLocaleString()} and an inactivity period exceeding ${days} days. This segment represents high-value churn risk.`,
      };
    }

    // Pattern: orders count
    if (lower.includes('order') && /\d/.test(lower)) {
      const numMatch = lower.match(/(\d+)\s*order/);
      const orders = numMatch ? Number(numMatch[1]) : 3;
      const conditions: AudienceFilterOutput['conditions'] = [
        { field: 'total_orders', op: 'gte', value: orders },
      ];
      if (lower.includes('high') || lower.includes('value') || lower.includes('loyal')) {
        conditions.push({ field: 'lifetime_value', op: 'gte', value: 5000 });
      }
      return {
        conditions,
        audienceName: `Repeat Buyers (${orders}+ Orders)`,
        audienceDescription: `Customers with at least ${orders} orders${conditions.length > 1 ? ' and high lifetime value' : ''}.`,
        reasoning: `Parsed minimum order count of ${orders}. ${conditions.length > 1 ? 'Also added a lifetime value filter for high-value intent.' : 'Single condition filter.'}`,
      };
    }

    // Pattern: city-based
    if (lower.includes('delhi') || lower.includes('mumbai') || lower.includes('bengaluru') || lower.includes('pune') || lower.includes('chennai')) {
      const cityMap: Record<string, string> = { delhi: 'Delhi', mumbai: 'Mumbai', bengaluru: 'Bengaluru', pune: 'Pune', chennai: 'Chennai' };
      const city = Object.keys(cityMap).find(c => lower.includes(c)) || 'Mumbai';
      const conditions: AudienceFilterOutput['conditions'] = [
        { field: 'city', op: 'eq', value: cityMap[city] },
      ];
      if (lower.includes('recent') || lower.includes('new')) {
        conditions.push({ field: 'last_purchase_days_ago', op: 'lt', value: 30 });
      }
      if (lower.includes('value') || lower.includes('high')) {
        conditions.push({ field: 'lifetime_value', op: 'gte', value: 5000 });
      }
      return {
        conditions,
        audienceName: `${cityMap[city]} Shoppers`,
        audienceDescription: `Customers located in ${cityMap[city]}${conditions.length > 1 ? ' with additional filters' : ''}.`,
        reasoning: `Detected city filter for ${cityMap[city]}. ${conditions.length > 1 ? 'Added supplementary conditions from context clues.' : 'Single geographic segment.'}`,
      };
    }

    // Pattern: persona-based
    if (lower.includes('churn') || lower.includes('risk')) {
      return {
        conditions: [
          { field: 'persona', op: 'eq', value: 'Churn Risk' },
          { field: 'lifetime_value', op: 'gte', value: 3000 },
        ],
        audienceName: 'Churn Risk Shoppers',
        audienceDescription: 'Customers identified as Churn Risk persona with meaningful lifetime value.',
        reasoning: 'Mapped "churn risk" to the Churn Risk persona and added a minimum LTV to focus on recoverable customers.',
      };
    }

    if (lower.includes('loyal') || lower.includes('vip') || lower.includes('premium')) {
      return {
        conditions: [
          { field: 'persona', op: 'eq', value: 'High Value Loyalist' },
        ],
        audienceName: 'VIP Loyalists',
        audienceDescription: 'Customers classified as High Value Loyalist persona.',
        reasoning: 'Mapped loyalty/VIP intent to the High Value Loyalist persona segment.',
      };
    }

    // Default fallback
    return {
      conditions: [
        { field: 'lifetime_value', op: 'gte', value: 5000 },
        { field: 'total_orders', op: 'gte', value: 2 },
      ],
      audienceName: 'Engaged Shoppers',
      audienceDescription: 'Customers with moderate-to-high lifetime value and repeat purchase behavior.',
      reasoning: `Could not identify specific filters from "${prompt}". Applied a general engaged-shopper filter as a starting point. You can refine the conditions below.`,
    };
  }

  // --- Feature 2: AI Campaign Planner ---
  async planCampaign(input: CampaignPlanInput): Promise<CampaignPlanOutput> {
    const lower = input.goal.toLowerCase();

    if (lower.includes('win back') || lower.includes('winback') || lower.includes('inactive') || lower.includes('dormant') || lower.includes('lapsed')) {
      const discountMatch = lower.match(/(\d+)%/);
      const discount = discountMatch ? discountMatch[1] : '15';
      return {
        campaignName: `Win-Back: ${discount}% Off for Returning Shoppers`,
        audienceRecommendation: 'High-Value Churn Risk',
        channelRecommendation: 'WhatsApp',
        headline: `We miss you, {{customer_name}}! Here's ${discount}% off`,
        messageBody: `Hi {{customer_name}}! 👋 It's been a while since your last {{favorite_category}} order. We've reserved {{recommended_product}} just for you.\n\nUse code COMEBACK${discount} for ${discount}% off your next purchase. This offer expires in 48 hours!\n\nTap to redeem: xn.co/wb${discount}`,
        cta: `Use COMEBACK${discount}`,
        reasoning: `Win-back campaigns work best on WhatsApp with urgency (48h expiry) and a personalized discount. Targeting the Churn Risk segment maximizes recovery potential. A ${discount}% discount balances margin with conversion.`,
      };
    }

    if (lower.includes('upsell') || lower.includes('premium') || lower.includes('subscription')) {
      return {
        campaignName: 'Premium Upgrade: Exclusive Collection Access',
        audienceRecommendation: 'Weekend Shoppers',
        channelRecommendation: 'Email',
        headline: '{{customer_name}}, unlock your premium {{favorite_category}} collection',
        messageBody: `Hello {{customer_name}},\n\nAs a valued shopper, you're invited to explore our premium {{favorite_category}} collection. Based on your purchase history, we think you'll love {{recommended_product}}.\n\nSubscribe today and enjoy:\n• 20% off your first premium order\n• Free priority shipping\n• Early access to new launches\n\n[Explore Premium →]`,
        cta: 'Explore Premium',
        reasoning: 'Email works well for premium/subscription upsells because it allows rich formatting and detailed value propositions. Weekend Shoppers are ideal because they have proven engagement and category affinity.',
      };
    }

    if (lower.includes('weekend') || lower.includes('fashion') || lower.includes('sale')) {
      return {
        campaignName: 'Weekend Flash Sale: Fashion & Lifestyle',
        audienceRecommendation: 'Weekend Shoppers',
        channelRecommendation: 'WhatsApp',
        headline: '🔥 Weekend Flash: Up to 40% off {{favorite_category}}',
        messageBody: `Hey {{customer_name}}! 🎉\n\nThis weekend only: grab up to 40% off across Fashion, Beauty, and Lifestyle.\n\nWe picked {{recommended_product}} based on your style. Shop before Sunday midnight!\n\nCode: WEEKEND40\nTap to shop: xn.co/wknd`,
        cta: 'Shop WEEKEND40',
        reasoning: 'Weekend shoppers respond best to time-boxed promotions on WhatsApp. Flash sale mechanics with Saturday morning delivery yield the highest same-day conversion rates.',
      };
    }

    // Generic fallback
    return {
      campaignName: `${input.goal} Campaign`,
      audienceRecommendation: 'All Registered Customers',
      channelRecommendation: 'WhatsApp',
      headline: `{{customer_name}}, something special awaits you`,
      messageBody: `Hi {{customer_name}}! We have an exciting update for your favorite {{favorite_category}} category.\n\nCheck out {{recommended_product}} — handpicked for shoppers like you.\n\n${input.notes ? `Note: ${input.notes}` : 'Limited time offer. Don\'t miss out!'}\n\nTap to explore: xn.co/special`,
      cta: 'Explore Now',
      reasoning: `Generated a general campaign for goal "${input.goal}". WhatsApp was selected as the default high-engagement channel. Refine the audience and copy below to match your specific objective.`,
    };
  }
}
