'use client';

import { useMemo, useState } from 'react';
import { Bot, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';
import { OperationsGPTCard } from '@/components/operations-gpt';
import { Badge, Card, Select } from '@/components/ui';
import { useRequests } from '@/hooks/useRequests';

type GeneratedAssessment = {
  current_project_stage: string;
  completion_estimate: string;
  risk_level: 'Low' | 'Medium' | 'High';
  strengths: string;
  weaknesses: string;
  missing_requirements: string;
  compliance_issues: string;
  assessment_summary: string;
};

type AssessmentResponse = {
  success?: boolean;
  assessment?: GeneratedAssessment;
  notice?: string;
  error?: string;
};

const emptyFilters = { search: '', status: '', priority: '', service: '', institution: '' };

export default function OperationsPage() {
  const { requests, isLoading: requestsLoading, error: requestsError } = useRequests(emptyFilters);
  const [requestId, setRequestId] = useState('');
  const [assessment, setAssessment] = useState<GeneratedAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>();

  const selectedRequest = useMemo(() => requests.find((request) => request.id === requestId) ?? null, [requests, requestId]);
  const requestOptions = useMemo(() => [
    { value: '', label: requestsLoading ? 'Loading requests...' : 'Select a request' },
    ...requests.map((request) => ({ value: request.id, label: `${request.request_reference} — ${request.working_title || 'Untitled request'}` })),
  ], [requests, requestsLoading]);

  const analyzeRequest = async () => {
    if (!requestId || isAnalyzing) return;
    setIsAnalyzing(true);
    setAssessment(null);
    setStatus('idle');
    setStatusMessage(undefined);

    try {
      const response = await fetch('/api/operations-gpt/assessment', {
        method: 'POST', credentials: 'include', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId }),
      });
      const data = (await response.json()) as AssessmentResponse;
      if (!response.ok || !data.assessment) throw new Error(data.error || 'Operations GPT could not generate an assessment.');
      setAssessment(data.assessment);
      setStatus('success');
      setStatusMessage(data.notice || 'Assessment draft generated successfully.');
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Operations GPT assessment failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-dark">Internal Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-950">Operations GPT</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Generate structured internal assessment drafts from submitted support requests for staff review.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: FileSearch, title: 'Request Analysis', text: 'Reviews request details and submitted document metadata.' },
          { icon: ShieldCheck, title: 'Human Review Required', text: 'Generated output remains a draft until staff review.' },
          { icon: Sparkles, title: 'Structured Assessment', text: 'Returns stage, risk, gaps, compliance issues and summary.' },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title} className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-green/10 p-2.5 text-brand-green"><Icon className="h-5 w-5" /></div>
              <div><p className="font-semibold text-gray-950">{title}</p><p className="mt-1 text-sm leading-6 text-gray-500">{text}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <OperationsGPTCard
        title="Assess Support Request"
        description="Select a submitted request and generate an internal assessment draft for staff review."
        buttonLabel="Generate Assessment"
        loadingLabel="Analyzing Request..."
        isLoading={isAnalyzing}
        disabled={!requestId || requestsLoading}
        status={status}
        statusMessage={statusMessage || requestsError || undefined}
        currentStep="Reviewing request details and preparing a structured assessment..."
        onAnalyze={analyzeRequest}
      >
        <div className="space-y-6">
          <Select
            label="Support Request"
            value={requestId}
            onChange={(event) => { setRequestId(event.target.value); setAssessment(null); setStatus('idle'); setStatusMessage(undefined); }}
            options={requestOptions}
            disabled={requestsLoading || isAnalyzing}
          />

          {selectedRequest && (
            <div className="grid gap-4 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-5 md:grid-cols-2 lg:grid-cols-4">
              <Meta label="Reference" value={selectedRequest.request_reference} mono />
              <Meta label="Service" value={selectedRequest.requested_service} />
              <Meta label="Priority" value={selectedRequest.priority} />
              <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Status</p><div className="mt-2"><Badge variant="info">{selectedRequest.status}</Badge></div></div>
            </div>
          )}

          {assessment && (
            <div className="space-y-5 rounded-[var(--radius-xl)] border border-brand-green/20 bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.05)] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div><h2 className="text-xl font-semibold text-gray-950">Assessment Draft</h2><p className="mt-1 text-sm text-gray-500">Internal draft for staff review only.</p></div>
                <Badge variant={assessment.risk_level === 'High' ? 'error' : assessment.risk_level === 'Medium' ? 'warning' : 'success'}>{assessment.risk_level} Risk</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AssessmentField label="Current Project Stage" value={assessment.current_project_stage} />
                <AssessmentField label="Completion Estimate" value={assessment.completion_estimate} />
                <AssessmentField label="Strengths" value={assessment.strengths} />
                <AssessmentField label="Weaknesses" value={assessment.weaknesses} />
                <AssessmentField label="Missing Requirements" value={assessment.missing_requirements} />
                <AssessmentField label="Compliance Issues" value={assessment.compliance_issues} />
              </div>

              <div className="rounded-[var(--radius-lg)] bg-[var(--surface-subtle)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Assessment Summary</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{assessment.assessment_summary || 'No summary returned.'}</p>
              </div>
            </div>
          )}
        </div>
      </OperationsGPTCard>
    </div>
  );
}

function Meta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</p><p className={`mt-2 text-sm font-medium ${mono ? 'font-mono text-brand-green' : 'text-gray-950'}`}>{value}</p></div>;
}

function AssessmentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{value || 'Not identified.'}</p>
    </div>
  );
}
