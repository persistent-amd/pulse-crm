import { SAMPLE_CUSTOMERS_CSV, SAMPLE_ORDERS_CSV, downloadCsv } from './sample-data';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000';

export interface ImportSummary {
  id: string;
  import_type: 'customers' | 'orders';
  filename: string;
  status: string;
  total_rows: number;
  imported_count: number;
  skipped_count: number;
  duplicate_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface DebugCustomer {
  id: string;
  external_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  city: string | null;
  lifetime_value: string;
  total_orders: number;
  last_purchase_date?: string | null;
  persona: string;
}

export interface DebugSummary {
  customers: number;
  orders: number;
  audiences: number;
  persona_breakdown: Record<string, number>;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function uploadImport(type: 'customers' | 'orders', file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<ImportSummary>(`/imports/${type}`, { method: 'POST', body: form });
}

export async function getDebugCustomers() {
  return apiFetch<DebugCustomer[]>('/debug/customers');
}

export async function getDebugSummary() {
  return apiFetch<DebugSummary>('/debug/summary');
}

export async function previewAudience(payload: unknown) {
  return apiFetch<{ size: number; sample_customers: DebugCustomer[] }>('/audiences/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function saveAudience(payload: unknown) {
  return apiFetch('/audiences', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listAudiences() {
  return apiFetch<Array<{ id: string; name: string; description: string | null; estimated_size: number; source: string; created_at: string }>>('/audiences');
}

export async function downloadSampleDataset(type: 'customers' | 'orders') {
  const filename = type === 'customers' ? 'sample-customers.csv' : 'sample-orders.csv';
  try {
    const response = await fetch(`${API_BASE_URL}/sample/${type}.csv`);
    if (!response.ok) throw new Error(`Sample download failed: ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    downloadCsv(filename, type === 'customers' ? SAMPLE_CUSTOMERS_CSV : SAMPLE_ORDERS_CSV);
  }
}
