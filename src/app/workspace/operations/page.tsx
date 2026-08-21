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

const emptyFilters = {
  search: '',
  status: '',
  priority: '',
  service: '',
  institution: '',
};

export default function OperationsPage() {
  const { requests, isLoading: requestsLoading, error: requestsError } = useRequests(emptyFilters);
  const [requestId, setRequestId] = useState('');
  const [assessment, setAssessment] = useState<GeneratedAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>();

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === requestId) ?? null,
    [requests, requestId]
  );

  const requestOptions = useMemo(
    () => [
      { value: '', label: requestsLoading ? 'Loading requests...' : 'Select a request' },
      ...requests.map((request) => ({
        value: request.id,
        label: `${request.request_reference} — ${request.working_title || 'Untitled request'}`,
      })),
    ],
    [requests, requestsLoading]
  );

  const analyzeRequest = async () => {
    if (!requestId || isAnalyzing) return;

    setIsAnalyzing(true);
    setAssessment(null);
    setStatus('idle');
    setStatusMessage(undefined);

    try {
      const response = await fetch('/api/operations-gpt/assessment', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = (await response.json()) as AssessmentResponse;

      if (!response.ok || !data.assessment) {
        throw new Error(data.error || 'Operations GPT could not generate an assessment.');
      }

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
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Operations GPT</h1>
            <p className="mt-1 text-gray-500">
              Generate internal assessment drafts from submitted JUSTmyTHESIS support requests.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-start gap-3">
            <FileSearch className="mt-1 h-5 w-5 text-brand-green" />
            <div>
              <p className="font-semibold text-gray-900">Request Analysis</p>
              <p className="mt-1 text-sm text-gray-500">Reads request details and submitted document metadata.</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-brand-green" />
            <div>
              <p className="font-semibold text-gray-900">Human Review Required</p>
              <p className="mt-1 text-sm text-gray-500">Generated output remains a draft until staff review.</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 text-brand-gold" />
            <div>
              <p className="font-semibold text-gray-900">Structured Assessment</p>
              <p className="mt-1 text-sm text-gray-500">Returns stage, risk, gaps, compliance issues and summary.</p>
            </div>
          </div>
        </Card>
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
        <div className="space-y-5">
          <Select
            label="Support Request"
            value={requestId}
            onChange={(event) => {
              setRequestId(event.target.value);
              setAssessment(null);
              setStatus('idle');
              setStatusMessage(undefined);
            }}
            options={requestOptions}
            disabled={requestsLoading || isAnalyzing}
          />

          {selectedRequest && (
            <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Reference</p>
                <p className="mt-1 font-mono text-sm font-semibold text-brand-green">{selectedRequest.request_reference}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Service</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.requested_service}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Priority</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.priority}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                <div className="mt-1"><Badge variant="info">{selectedRequest.status}</Badge></div>
              </div>
            </div>
          )}

          {assessment && (
            <div className="space-y-4 rounded-xl border border-brand-green/20 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Assessment Draft</h2>
                  <p className="mt-1 text-sm text-gray-500">Internal draft for staff review only.</p>
                </div>
                <Badge variant={assessment.risk_level === 'High' ? 'error' : assessment.risk_level === 'Medium' ? 'warning' : 'success'}>
                  {assessment.risk_level} Risk
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <AssessmentField label="Current Project Stage" value={assessment.current_project_stage} />
                <AssessmentField label="Completion Estimate" value={assessment.completion_estimate} />
                <AssessmentField label="Strengths" value={assessment.strengths} />
                <AssessmentField label="Weaknesses" value={assessment.weaknesses} />
                <AssessmentField label="Missing Requirements" value={assessment.missing_requirements} />
                <AssessmentField label="Compliance Issues" value={assessment.compliance_issues} />
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assessment Summary</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{assessment.assessment_summary || 'No summary returned.'}</p>
              </div>
            </div>
          )}
        </div>
      </OperationsGPTCard>
    </div>
  );
}

function AssessmentField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{value || 'Not identified.'}</p>
    </div>
  );
}
