export const CUSTOMER_CSV_SCHEMA = ['external_id', 'name', 'email', 'phone', 'city'];

export const ORDER_CSV_SCHEMA = [
  'external_order_id',
  'customer_external_id',
  'order_date',
  'amount',
  'category',
  'product',
  'status',
];

export const SAMPLE_CUSTOMERS_CSV = `external_id,name,email,phone,city
CUST-DEMO-001,Asha Mehta,asha.mehta@example.com,+919000000001,Mumbai
CUST-DEMO-002,Rohan Shah,rohan.shah@example.com,+919000000002,Delhi
CUST-DEMO-003,Meera Iyer,meera.iyer@example.com,+919000000003,Bengaluru
CUST-DEMO-004,Vihaan Kapoor,vihaan.kapoor@example.com,+919000000004,Pune
CUST-DEMO-005,Tara Khanna,tara.khanna@example.com,+919000000005,Chennai
`;

export const SAMPLE_ORDERS_CSV = `external_order_id,customer_external_id,order_date,amount,category,product,status
ORD-DEMO-001,CUST-DEMO-001,2026-04-01,6999.00,Electronics,Smart Speaker,paid
ORD-DEMO-002,CUST-DEMO-001,2026-04-14,3499.00,Fashion,Sneakers,paid
ORD-DEMO-003,CUST-DEMO-001,2026-05-05,2499.00,Fashion,Weekend Dress,paid
ORD-DEMO-004,CUST-DEMO-002,2026-03-10,1799.00,Coffee,French Press,paid
ORD-DEMO-005,CUST-DEMO-002,2026-05-25,1299.00,Coffee,Mocha Gift Box,paid
ORD-DEMO-006,CUST-DEMO-003,2026-06-08,1499.00,Beauty,Hydrating Cream,paid
ORD-DEMO-007,CUST-DEMO-003,2026-06-10,1199.00,Beauty,Glow Serum,paid
ORD-DEMO-008,CUST-DEMO-004,2026-05-18,1299.00,Fitness,Yoga Mat,paid
ORD-DEMO-009,CUST-DEMO-004,2026-06-01,799.00,Fitness,Resistance Bands,paid
ORD-DEMO-010,CUST-DEMO-005,2026-02-20,4999.00,Electronics,Wireless Earbuds,paid
`;

export function validateCsvHeaders(csvText: string, requiredHeaders: string[]) {
  const firstLine = csvText.split(/\r?\n/).find(Boolean) ?? '';
  const headers = firstLine.split(',').map((header) => header.trim().replace(/^"|"$/g, ''));
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  return { valid: missing.length === 0, headers, missing };
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
