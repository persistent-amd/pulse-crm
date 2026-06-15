'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  History,
  Loader2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  downloadSampleDataset,
  uploadImport,
  type ImportSummary
} from '@/lib/api';
import {
  CUSTOMER_CSV_SCHEMA,
  ORDER_CSV_SCHEMA,
  validateCsvHeaders
} from '@/lib/sample-data';
import { addDemoActivity, makeId, nowLabel } from '@/lib/demo-state';

interface ImportHistoryItem {
  id: string;
  filename: string;
  type: 'Customers' | 'Orders';
  total: number;
  imported: number;
  skipped: number;
  duplicate: number;
  failed: number;
  date: string;
  status: 'Completed' | 'Failed' | 'Processing';
}

export default function ImportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultMessage, setResultMessage] = useState<ImportHistoryItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [history, setHistory] = useState<ImportHistoryItem[]>([
    {
      id: 'job-948',
      filename: 'customers-june-batch.csv',
      type: 'Customers',
      total: 1000,
      imported: 982,
      skipped: 18,
      duplicate: 12,
      failed: 0,
      date: '2026-06-14 06:12 AM',
      status: 'Completed'
    },
    {
      id: 'job-947',
      filename: 'orders-q2-consolidated.csv',
      type: 'Orders',
      total: 5000,
      imported: 4945,
      skipped: 55,
      duplicate: 0,
      failed: 15,
      date: '2026-06-13 11:34 PM',
      status: 'Completed'
    },
    {
      id: 'job-946',
      filename: 'invalid-fields-test.csv',
      type: 'Customers',
      total: 50,
      imported: 32,
      skipped: 0,
      duplicate: 0,
      failed: 18,
      date: '2026-06-12 04:22 PM',
      status: 'Failed'
    }
  ]);

  const handleDownloadCustomers = () => downloadSampleDataset('customers');

  const handleDownloadOrders = () => downloadSampleDataset('orders');

  const mapImportSummary = (summary: ImportSummary, filename: string): ImportHistoryItem => ({
    id: summary.id.slice(0, 8),
    filename,
    type: summary.import_type === 'customers' ? 'Customers' : 'Orders',
    total: summary.total_rows,
    imported: summary.imported_count,
    skipped: summary.skipped_count,
    duplicate: summary.duplicate_count,
    failed: summary.failed_count,
    date: (summary.completed_at || summary.created_at || new Date().toISOString()).replace('T', ' ').substring(0, 19),
    status: summary.status === 'failed' ? 'Failed' : 'Completed'
  });

  const createFallbackSummary = (fileName: string, csvText: string): ImportHistoryItem => {
    const total = Math.max(csvText.trim().split(/\r?\n/).length - 1, 0);
    const isCustomers = activeTab === 'customers';
    return {
      id: makeId('demo-job'),
      filename: fileName,
      type: isCustomers ? 'Customers' : 'Orders',
      total,
      imported: total,
      skipped: 0,
      duplicate: 0,
      failed: 0,
      date: nowLabel(),
      status: 'Completed'
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const recordActivity = (job: ImportHistoryItem, fallback: boolean) => {
    addDemoActivity({
      id: makeId('evt-import'),
      type: 'import',
      title: `CSV Ingestion Completed: ${job.filename}`,
      description: `${job.type} import processed ${job.total} rows with ${job.imported} imported and ${job.duplicate} duplicates. ${job.type === 'Orders' ? 'Customer metrics and personas were recomputed after order ingestion.' : 'Customer profile records are ready for order matching.'}${fallback ? ' Demo fallback was used because the CRM API was unavailable.' : ''}`,
      timestamp: job.date,
      badge: fallback ? 'Demo Fallback' : 'Success',
      badgeColor: fallback
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      meta: [
        { label: 'Rows Parsed', value: job.total.toLocaleString() },
        { label: 'Imported', value: job.imported.toLocaleString() },
        { label: 'Job ID', value: job.id }
      ]
    });

    if (job.type === 'Orders') {
      addDemoActivity({
        id: makeId('evt-metrics'),
        type: 'audience',
        title: 'Customer Metrics and Personas Recomputed',
        description: 'Order ingestion refreshed lifetime value, order counts, favorite category, last purchase date, and deterministic persona assignments.',
        timestamp: nowLabel(),
        badge: 'Personas Updated',
        badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        meta: [
          { label: 'Metric Table', value: 'customer_metrics' },
          { label: 'Persona Engine', value: 'Rule based' }
        ]
      });
    }
  };

  const processUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Only .csv files are supported. Download the official sample file to compare the exact schema.');
      return;
    }

    const csvText = await file.text();
    const requiredHeaders = activeTab === 'customers' ? CUSTOMER_CSV_SCHEMA : ORDER_CSV_SCHEMA;
    const validation = validateCsvHeaders(csvText, requiredHeaders);
    if (!validation.valid) {
      setErrorMessage(`Missing required columns: ${validation.missing.join(', ')}. Expected: ${requiredHeaders.join(', ')}.`);
      return;
    }

    setUploading(true);
    setProgress(0);
    setResultMessage(null);
    setErrorMessage('');

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) return prev;
        return prev + 10;
      });
    }, 120);

    try {
      const summary = await uploadImport(activeTab, file);
      const newJob = mapImportSummary(summary, file.name);
      setProgress(100);
      setResultMessage(newJob);
      setHistory(prevHistory => [newJob, ...prevHistory]);
      recordActivity(newJob, false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      const isNetworkFailure = message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network');
      if (!isNetworkFailure) {
        setErrorMessage(`Import rejected by backend: ${message}`);
        return;
      }

      const fallbackJob = createFallbackSummary(file.name, csvText);
      setProgress(100);
      setResultMessage(fallbackJob);
      setHistory(prevHistory => [fallbackJob, ...prevHistory]);
      recordActivity(fallbackJob, true);
    } finally {
      clearInterval(interval);
      setTimeout(() => setUploading(false), 350);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h2 className="title-page">Ingestion Pipeline</h2>
          <p className="text-xs text-muted-foreground mt-1">Upload CSV shopper and order data feeds to recompute analytics and trigger segmentation.</p>
        </div>

        <div className="flex flex-col sm:items-end gap-2.5">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadCustomers}
              className="px-3.5 py-2 text-xs font-semibold rounded bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download Sample Customers CSV</span>
            </button>
            <button
              onClick={handleDownloadOrders}
              className="px-3.5 py-2 text-xs font-semibold rounded bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download Sample Orders CSV</span>
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium italic sm:text-right">
            Use sample files to quickly explore the platform.
          </span>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border flex items-center gap-6">
        <button
          onClick={() => { setActiveTab('customers'); setResultMessage(null); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'customers' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span>1. Customer Profiles Feed</span>
          {activeTab === 'customers' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('orders'); setResultMessage(null); }}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'orders' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span>2. Order Transactions Feed</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </section>

      {/* Upload layout grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Centered Upload Container (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`depth-panel border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'
              }`}
          >
            {uploading ? (
              <div className="space-y-4 w-full max-w-xs text-center flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="space-y-2 w-full">
                  <p className="text-xs font-semibold">Validating and parsing rows...</p>
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-meta">{progress}% parsed</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-border flex items-center justify-center text-primary">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground cursor-pointer hover:underline block">
                    <span>Click to browse</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">or drag and drop your CSV file here</p>
                </div>

                <div className="pt-3 border-t border-border/30 max-w-sm mx-auto text-meta">
                  {activeTab === 'customers' ? (
                    <span>Columns: <strong className="text-foreground">external_id, name, email, phone, city</strong></span>
                  ) : (
                    <span>Columns: <strong className="text-foreground">external_order_id, customer_external_id, order_date, amount, category, product, status</strong></span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alert Banner */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-primary">Idempotent Deduplication Engine Active</p>
              <p className="text-muted-foreground leading-normal">
                The database automatically resolves duplicate orders by <code className="text-foreground font-semibold font-mono bg-zinc-900 px-1 rounded">external_order_id</code> and filters client profiles by phone/email matches. Re-uploading does not corrupt metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Results Feedback Panel */}
        <div className="depth-panel rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="title-section border-b border-border/30 pb-2">
              Pipeline Status
            </h4>

            {resultMessage ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  {resultMessage.status === 'Completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <div>
                    <h5 className="text-xs font-bold truncate max-w-[180px]">{resultMessage.filename}</h5>
                    <p className="text-meta uppercase">{resultMessage.id} • {resultMessage.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-zinc-950/40 border border-border">
                    <span className="text-[9px] text-muted-foreground block font-sans">Rows Parsed</span>
                    <span className="font-bold text-foreground">{resultMessage.total}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950/40 border border-border">
                    <span className="text-[9px] text-muted-foreground block font-sans">Imported</span>
                    <span className="font-bold text-emerald-400">{resultMessage.imported}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950/40 border border-border">
                    <span className="text-[9px] text-muted-foreground block font-sans">Duplicates</span>
                    <span className="font-bold text-amber-500">{resultMessage.duplicate}</span>
                  </div>
                  <div className="p-2.5 rounded bg-zinc-950/40 border border-border">
                    <span className="text-[9px] text-muted-foreground block font-sans">Failures</span>
                    <span className="font-bold text-red-500">{resultMessage.failed}</span>
                  </div>
                </div>

                {resultMessage.failed > 0 && (
                  <button
                    onClick={() => alert("Downloading import error CSV containing row validation stacktraces...")}
                    className="w-full py-2 text-xs font-semibold rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Errors report.csv</span>
                  </button>
                )}
              </div>
            ) : errorMessage ? (
              <div className="text-center py-10 text-red-400 text-xs space-y-3">
                <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="leading-relaxed">{errorMessage}</p>
                <button
                  onClick={activeTab === 'customers' ? handleDownloadCustomers : handleDownloadOrders}
                  className="px-3 py-2 text-xs font-semibold rounded bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all inline-flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Download official schema</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-border mx-auto" />
                <p>Drag or upload a feed CSV above to display diagnostic parse summaries.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/app')}
            className="w-full py-2.5 mt-6 text-xs font-semibold rounded bg-zinc-900 hover:bg-zinc-800 border border-border text-foreground hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Ingestion Log History */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="title-section">Ingestion History Logs</h3>
        </div>

        <div className="depth-panel rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/[0.01] text-muted-foreground text-[10px] uppercase font-mono tracking-wider">
                  <th className="p-4">Job ID</th>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Total Rows</th>
                  <th className="p-4">Imported</th>
                  <th className="p-4">Deduplicated</th>
                  <th className="p-4">Failed</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">{job.id}</td>
                    <td className="p-4 font-semibold">{job.filename}</td>
                    <td className="p-4">{job.type}</td>
                    <td className="p-4 font-mono">{job.total}</td>
                    <td className="p-4 font-mono text-emerald-400">{job.imported}</td>
                    <td className="p-4 font-mono text-amber-500">{job.duplicate}</td>
                    <td className="p-4 font-mono text-red-500">{job.failed}</td>
                    <td className="p-4 text-muted-foreground font-mono">{job.date}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${job.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
