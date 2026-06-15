// Mock Data & Simulation Engine for Pulse CRM

export interface Customer {
  id: string;
  external_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  persona: 'High Value Loyalist' | 'Weekend Shopper' | 'Discount Hunter' | 'Churn Risk' | 'New Customer';
  ltv: number;
  ordersCount: number;
  aov: number;
  lastPurchaseDaysAgo: number;
  lastPurchaseDate: string;
  favoriteCategory: string;
  recentOrders: Order[];
  campaignHistory: CampaignInteraction[];
  timeline: TimelineEvent[];
}

export interface Order {
  id: string;
  external_order_id: string;
  customer_external_id: string;
  order_date: string;
  amount: number;
  category: string;
  product: string;
  status: 'paid' | 'refunded' | 'pending';
}

export interface CampaignInteraction {
  campaignId: string;
  campaignName: string;
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'RCS';
  status: 'sent' | 'delivered' | 'read' | 'clicked' | 'converted' | 'failed';
  date: string;
  revenue?: number;
}

export interface TimelineEvent {
  id: string;
  type: 'import' | 'audience' | 'campaign_sent' | 'campaign_interaction' | 'purchase';
  title: string;
  description: string;
  timestamp: string;
  meta?: any;
}

export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad"
];

export const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Coffee",
  "Electronics",
  "Home",
  "Fitness"
];

export const PERSONAS = [
  "High Value Loyalist",
  "Weekend Shopper",
  "Discount Hunter",
  "Churn Risk",
  "New Customer"
] as const;

export const PRODUCTS_BY_CATEGORY: Record<string, { name: string; price: number }[]> = {
  Fashion: [
    { name: "Denim Jacket", price: 2999 },
    { name: "Cotton Shirt", price: 1299 },
    { name: "Sneakers", price: 3499 },
    { name: "Weekend Dress", price: 2499 }
  ],
  Beauty: [
    { name: "Glow Serum", price: 1199 },
    { name: "Matte Lipstick", price: 799 },
    { name: "Hydrating Cream", price: 1499 },
    { name: "Sunscreen Gel", price: 899 }
  ],
  Coffee: [
    { name: "Cold Brew Pack", price: 599 },
    { name: "Arabica Beans", price: 899 },
    { name: "French Press", price: 1799 },
    { name: "Mocha Gift Box", price: 1299 }
  ],
  Electronics: [
    { name: "Wireless Earbuds", price: 4999 },
    { name: "Smart Speaker", price: 6999 },
    { name: "Power Bank", price: 1799 },
    { name: "Fitness Band", price: 2999 }
  ],
  Home: [
    { name: "Scented Candle", price: 699 },
    { name: "Desk Lamp", price: 2299 },
    { name: "Storage Basket", price: 999 },
    { name: "Throw Blanket", price: 1899 }
  ],
  Fitness: [
    { name: "Yoga Mat", price: 1299 },
    { name: "Protein Shaker", price: 499 },
    { name: "Training Tee", price: 999 },
    { name: "Resistance Bands", price: 799 }
  ]
};

// Generates 100 high-fidelity seed customers for front-end rendering
export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    external_id: "CUST-00001",
    name: "Aarav Mehta",
    email: "aarav.mehta1@example.com",
    phone: "+919876543210",
    city: "Mumbai",
    persona: "High Value Loyalist",
    ltv: 24500,
    ordersCount: 8,
    aov: 3062.5,
    lastPurchaseDaysAgo: 5,
    lastPurchaseDate: "2026-06-09",
    favoriteCategory: "Coffee",
    recentOrders: [
      { id: "o-1", external_order_id: "ORD-00001", customer_external_id: "CUST-00001", order_date: "2026-06-09", amount: 1299, category: "Coffee", product: "Mocha Gift Box", status: "paid" },
      { id: "o-2", external_order_id: "ORD-00002", customer_external_id: "CUST-00001", order_date: "2026-05-14", amount: 1799, category: "Coffee", product: "French Press", status: "paid" }
    ],
    campaignHistory: [
      { campaignId: "camp-01", campaignName: "Mocha Launch Promo", channel: "WhatsApp", status: "converted", date: "2026-06-08", revenue: 1299 },
      { campaignId: "camp-02", campaignName: "Coffee Brewer Special", channel: "Email", status: "read", date: "2026-05-12" }
    ],
    timeline: [
      { id: "t-1", type: "purchase", title: "Purchased Mocha Gift Box", description: "Spent ₹1,299 via WhatsApp campaign attribution.", timestamp: "2026-06-09T14:32:00Z" },
      { id: "t-2", type: "campaign_interaction", title: "Opened WhatsApp Message", description: "Viewed campaign: Mocha Launch Promo", timestamp: "2026-06-08T18:15:00Z" },
      { id: "t-3", type: "campaign_sent", title: "WhatsApp Sent", description: "Campaign: Mocha Launch Promo dispatched", timestamp: "2026-06-08T18:00:00Z" }
    ]
  },
  {
    id: "cust-002",
    external_id: "CUST-00002",
    name: "Aditi Iyer",
    email: "aditi.iyer2@example.com",
    phone: "+919812345678",
    city: "Bengaluru",
    persona: "Weekend Shopper",
    ltv: 11497,
    ordersCount: 4,
    aov: 2874.25,
    lastPurchaseDaysAgo: 2,
    lastPurchaseDate: "2026-06-12",
    favoriteCategory: "Fashion",
    recentOrders: [
      { id: "o-3", external_order_id: "ORD-00003", customer_external_id: "CUST-00002", order_date: "2026-06-12", amount: 3499, category: "Fashion", product: "Sneakers", status: "paid" }
    ],
    campaignHistory: [
      { campaignId: "camp-03", campaignName: "Weekend Glow-Up Special", channel: "WhatsApp", status: "clicked", date: "2026-06-12" }
    ],
    timeline: [
      { id: "t-4", type: "purchase", title: "Purchased Sneakers", description: "Spent ₹3,499. Order placed on Saturday.", timestamp: "2026-06-12T11:20:00Z" }
    ]
  },
  {
    id: "cust-003",
    external_id: "CUST-00003",
    name: "Advait Gupta",
    email: "advait.gupta3@example.com",
    phone: "+919765432109",
    city: "Delhi",
    persona: "Churn Risk",
    ltv: 18500,
    ordersCount: 5,
    aov: 3700,
    lastPurchaseDaysAgo: 65,
    lastPurchaseDate: "2026-04-10",
    favoriteCategory: "Electronics",
    recentOrders: [
      { id: "o-4", external_order_id: "ORD-00004", customer_external_id: "CUST-00003", order_date: "2026-04-10", amount: 6999, category: "Electronics", product: "Smart Speaker", status: "paid" }
    ],
    campaignHistory: [
      { campaignId: "camp-04", campaignName: "Winback High-Value Shoppers", channel: "SMS", status: "delivered", date: "2026-06-10" }
    ],
    timeline: [
      { id: "t-5", type: "campaign_sent", title: "SMS Delivered", description: "Campaign: Winback High-Value Shoppers", timestamp: "2026-06-10T10:00:00Z" },
      { id: "t-6", type: "purchase", title: "Purchased Smart Speaker", description: "Spent ₹6,999. Inactive since this date.", timestamp: "2026-04-10T16:45:00Z" }
    ]
  },
  {
    id: "cust-004",
    external_id: "CUST-00004",
    name: "Anaya Patel",
    email: "anaya.patel4@example.com",
    phone: "+919988776655",
    city: "Ahmedabad",
    persona: "Discount Hunter",
    ltv: 4296,
    ordersCount: 3,
    aov: 1432,
    lastPurchaseDaysAgo: 12,
    lastPurchaseDate: "2026-06-02",
    favoriteCategory: "Beauty",
    recentOrders: [
      { id: "o-5", external_order_id: "ORD-00005", customer_external_id: "CUST-00004", order_date: "2026-06-02", amount: 799, category: "Beauty", product: "Matte Lipstick", status: "paid" }
    ],
    campaignHistory: [
      { campaignId: "camp-05", campaignName: "Summer Clearance 20%", channel: "WhatsApp", status: "clicked", date: "2026-06-02" }
    ],
    timeline: [
      { id: "t-7", type: "purchase", title: "Purchased Matte Lipstick", description: "Discount code applied. Saved 20%.", timestamp: "2026-06-02T13:10:00Z" }
    ]
  },
  {
    id: "cust-005",
    external_id: "CUST-00005",
    name: "Arjun Singh",
    email: "arjun.singh5@example.com",
    phone: "+919944332211",
    city: "Pune",
    persona: "New Customer",
    ltv: 1299,
    ordersCount: 1,
    aov: 1299,
    lastPurchaseDaysAgo: 10,
    lastPurchaseDate: "2026-06-04",
    favoriteCategory: "Fitness",
    recentOrders: [
      { id: "o-6", external_order_id: "ORD-00006", customer_external_id: "CUST-00005", order_date: "2026-06-04", amount: 1299, category: "Fitness", product: "Yoga Mat", status: "paid" }
    ],
    campaignHistory: [],
    timeline: [
      { id: "t-8", type: "purchase", title: "First Purchase: Yoga Mat", description: "Spent ₹1,299. Welcome onboard event triggered.", timestamp: "2026-06-04T17:30:00Z" }
    ]
  },
  {
    id: "cust-006",
    external_id: "CUST-00006",
    name: "Diya Nair",
    email: "diya.nair6@example.com",
    phone: "+919933445566",
    city: "Chennai",
    persona: "High Value Loyalist",
    ltv: 32000,
    ordersCount: 12,
    aov: 2666.67,
    lastPurchaseDaysAgo: 4,
    lastPurchaseDate: "2026-06-10",
    favoriteCategory: "Beauty",
    recentOrders: [
      { id: "o-7", external_order_id: "ORD-00007", customer_external_id: "CUST-00006", order_date: "2026-06-10", amount: 1499, category: "Beauty", product: "Hydrating Cream", status: "paid" }
    ],
    campaignHistory: [
      { campaignId: "camp-06", campaignName: "VIP Hydration Secret", channel: "WhatsApp", status: "converted", date: "2026-06-10", revenue: 1499 }
    ],
    timeline: [
      { id: "t-9", type: "purchase", title: "Purchased Hydrating Cream", description: "VIP early access product conversion.", timestamp: "2026-06-10T12:00:00Z" }
    ]
  },
  {
    id: "cust-007",
    external_id: "CUST-00007",
    name: "Vihaan Kapoor",
    email: "vihaan.kapoor7@example.com",
    phone: "+919922114433",
    city: "Hyderabad",
    persona: "Weekend Shopper",
    ltv: 7498,
    ordersCount: 3,
    aov: 2499,
    lastPurchaseDaysAgo: 8,
    lastPurchaseDate: "2026-06-06",
    favoriteCategory: "Fashion",
    recentOrders: [
      { id: "o-8", external_order_id: "ORD-00008", customer_external_id: "CUST-00007", order_date: "2026-06-06", amount: 2499, category: "Fashion", product: "Weekend Dress", status: "paid" }
    ],
    campaignHistory: [],
    timeline: [
      { id: "t-10", type: "purchase", title: "Purchased Weekend Dress", description: "Spent ₹2,499. Weekend checkout transaction.", timestamp: "2026-06-06T19:45:00Z" }
    ]
  },
  {
    id: "cust-008",
    external_id: "CUST-00008",
    name: "Tara Khanna",
    email: "tara.khanna8@example.com",
    phone: "+919911882233",
    city: "Kolkata",
    persona: "Churn Risk",
    ltv: 14999,
    ordersCount: 3,
    aov: 4999.67,
    lastPurchaseDaysAgo: 90,
    lastPurchaseDate: "2026-03-16",
    favoriteCategory: "Electronics",
    recentOrders: [
      { id: "o-9", external_order_id: "ORD-00009", customer_external_id: "CUST-00008", order_date: "2026-03-16", amount: 4999, category: "Electronics", product: "Wireless Earbuds", status: "paid" }
    ],
    campaignHistory: [],
    timeline: [
      { id: "t-11", type: "purchase", title: "Purchased Wireless Earbuds", description: "High ticket electronics purchase. Inactive since March.", timestamp: "2026-03-16T15:20:00Z" }
    ]
  }
];

// Add procedural generated mock database items up to 100 records for robust UI search & filters
export function getMockCustomers(): Customer[] {
  const list = [...SEED_CUSTOMERS];
  const firstNames = ["Kavya", "Shaurya", "Rohan", "Saanvi", "Zoya", "Ishaan", "Naina", "Meera", "Advait", "Tara"];
  const lastNames = ["Khanna", "Verma", "Bansal", "Chopra", "Shah", "Kapoor", "Agarwal", "Gupta", "Mehta", "Iyer"];
  
  for (let i = 9; i <= 60; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const city = CITIES[i % CITIES.length];
    const extId = `CUST-${String(i).padStart(5, '0')}`;
    const ordersCount = (i % 6) + 1;
    const ltv = ordersCount * (800 + (i * 75) % 3000);
    const aov = Number((ltv / ordersCount).toFixed(2));
    const lastPurchaseDaysAgo = ((i * 13) % 120);
    const category = CATEGORIES[i % CATEGORIES.length];
    const productItem = PRODUCTS_BY_CATEGORY[category][i % PRODUCTS_BY_CATEGORY[category].length];
    
    // assign persona logic
    let persona: Customer['persona'] = 'New Customer';
    if (lastPurchaseDaysAgo > 60 && ordersCount >= 2) persona = 'Churn Risk';
    else if (ltv >= 10000 && ordersCount >= 4) persona = 'High Value Loyalist';
    else if (i % 4 === 0) persona = 'Weekend Shopper';
    else if (aov < 1500) persona = 'Discount Hunter';
    
    const lastPurchaseDate = new Date();
    lastPurchaseDate.setDate(lastPurchaseDate.getDate() - lastPurchaseDaysAgo);
    const dateStr = lastPurchaseDate.toISOString().split('T')[0];

    list.push({
      id: `cust-${i}`,
      external_id: extId,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      phone: `+9199${(10000000 + i * 27) % 100000000}`,
      city,
      persona,
      ltv,
      ordersCount,
      aov,
      lastPurchaseDaysAgo,
      lastPurchaseDate: dateStr,
      favoriteCategory: category,
      recentOrders: [
        {
          id: `o-m-${i}`,
          external_order_id: `ORD-m-${i}`,
          customer_external_id: extId,
          order_date: dateStr,
          amount: productItem.price,
          category,
          product: productItem.name,
          status: 'paid'
        }
      ],
      campaignHistory: [
        {
          campaignId: `camp-m-${i}`,
          campaignName: `${category} Engagement Campaign`,
          channel: i % 2 === 0 ? 'WhatsApp' : 'Email',
          status: i % 3 === 0 ? 'converted' : i % 3 === 1 ? 'read' : 'delivered',
          date: dateStr,
          revenue: i % 3 === 0 ? productItem.price : undefined
        }
      ],
      timeline: [
        {
          id: `t-m-${i}`,
          type: 'purchase',
          title: `Purchased ${productItem.name}`,
          description: `Spent ₹${productItem.price.toLocaleString()} in category ${category}`,
          timestamp: `${dateStr}T12:00:00Z`
        }
      ]
    });
  }
  return list;
}

// Generate realistic CSV files containing 1000 customers and 5000 orders
export function generateCustomersCSV(count = 1000): string {
  let csv = "external_id,name,email,phone,city\n";
  const firstNames = ["Aarav", "Aditi", "Advait", "Anaya", "Arjun", "Diya", "Ishaan", "Kavya", "Meera", "Naina", "Rohan", "Saanvi", "Shaurya", "Tara", "Vihaan", "Zoya"];
  const lastNames = ["Agarwal", "Bansal", "Chopra", "Gupta", "Iyer", "Kapoor", "Khanna", "Mehta", "Nair", "Patel", "Rao", "Shah", "Singh", "Verma"];
  
  for (let i = 1; i <= count; i++) {
    const rng1 = (i * 17) % firstNames.length;
    const rng2 = (i * 23) % lastNames.length;
    const rngCity = (i * 31) % CITIES.length;
    
    const extId = `CUST-${String(i).padStart(5, '0')}`;
    const name = `${firstNames[rng1]} ${lastNames[rng2]}`;
    const email = `${firstNames[rng1].toLowerCase()}.${lastNames[rng2].toLowerCase()}${i}@example.com`;
    const phone = `+91${9000000000 + i}`;
    const city = CITIES[rngCity];
    
    csv += `${extId},"${name}",${email},${phone},${city}\n`;
  }
  return csv;
}

export function generateOrdersCSV(count = 5000, customerCount = 1000): string {
  let csv = "external_order_id,customer_external_id,order_date,amount,category,product,status\n";
  const categories = Object.keys(PRODUCTS_BY_CATEGORY);
  
  for (let i = 1; i <= count; i++) {
    const custIdx = ((i * 47) % customerCount) + 1;
    const customerExtId = `CUST-${String(custIdx).padStart(5, '0')}`;
    
    const catIdx = (i * 13) % categories.length;
    const category = categories[catIdx];
    const products = PRODUCTS_BY_CATEGORY[category];
    const productObj = products[(i * 7) % products.length];
    
    // dates spread over the last 12 months
    const dateOffset = (i * 3) % 365;
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - dateOffset);
    const dateStr = orderDate.toISOString().split('T')[0];
    
    // Add realistic pricing multiplier
    const priceMultiplier = 1.0 + ((i % 5) - 2) * 0.05; // 0.90 to 1.10
    const price = Math.round(productObj.price * priceMultiplier);
    
    csv += `ORD-${String(i).padStart(6, '0')},${customerExtId},${dateStr},${price},${category},"${productObj.name}",paid\n`;
  }
  return csv;
}
