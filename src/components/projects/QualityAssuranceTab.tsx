'use client';

import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Save,
  Shield,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const QA_STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'Pending', label: 'Pending' },
  {
    value: 'In Progress',
    label: 'In Progress',
  },
  {
    value: 'Corrections Required',
    label: 'Corrections Required',
  },
  { value: 'Approved', label: 'Approved' },
];

interface QAReview {
  id: string;
  project_id: string;
  structure_review: string | null;
  formatting_review: string | null;
  citation_review: string | null;
  compliance_review: string | null;
  overall_status: string | null;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  updated_by: string | null;
  reviewed_by_name?: string | null;
  updated_by_name?: string | null;
  created_at: string;
  updated_at: string | null;
}

interface QAResponse {
  success?: boolean;
  qa_review?: QAReview | null;
  error?: string;
}

interface QAForm {
  structure_review: string;
  formatting_review: string;
  citation_review: string;
  compliance_review: string;
  overall_status: string;
  reviewer_notes: string;
}

interface QualityAssuranceTabProps {
  projectId: string;
  isCompleted: boolean;
}

const EMPTY_FORM: QAForm = {
  structure_review: '',
  formatting_review: '',
  citation_review: '',
  compliance_review: '',
  overall_status: '',
  reviewer_notes: '',
};

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function mapReviewToForm(
  review: QAReview | null
): QAForm {
  if (!review) {
    return EMPTY_FORM;
  }

  let status = review.overall_status || '';

  if (status === 'Passed') {
    status = 'Approved';
  }

  if (status === 'Failed') {
    status = 'Corrections Required';
  }

  return {
    structure_review:
      review.structure_review || '',
    formatting_review:
      review.formatting_review || '',
    citation_review:
      review.citation_review || '',
    compliance_review:
      review.compliance_review || '',
    overall_status: status,
    reviewer_notes: review.reviewer_notes || '',
  };
}

export default function QualityAssuranceTab({
  projectId,
  isCompleted,
}: QualityAssuranceTabProps) {
  const [review, setReview] =
    useState<QAReview | null>(null);
  const [form, setForm] =
    useState<QAForm>(EMPTY_FORM);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/projects/${encodeURIComponent(
          projectId
        )}/qa`,
        {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const result =
        (await response.json()) as QAResponse;

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to retrieve the QA review.'
        );
      }

      const savedReview = result.qa_review || null;

      setReview(savedReview);
      setForm(mapReviewToForm(savedReview));
    } catch (requestError) {
      setReview(null);
      setForm(EMPTY_FORM);

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to retrieve the QA review.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchReview();
  }, [fetchReview]);

  const updateField = (
    field: keyof QAForm,
    value: string
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setError(null);
    setSuccessMessage(null);
  };

  const validateForm = (): string | null => {
    if (!form.overall_status) {
      return 'Select an overall QA status.';
    }

    if (form.overall_status === 'Approved') {
      if (!form.structure_review.trim()) {
        return 'Complete the structure review before approval.';
      }

      if (!form.formatting_review.trim()) {
        return 'Complete the formatting review before approval.';
      }

      if (!form.citation_review.trim()) {
        return 'Complete the citation review before approval.';
      }

      if (!form.compliance_review.trim()) {
        return 'Complete the compliance review before approval.';
      }
    }

    if (
      form.overall_status ===
        'Corrections Required' &&
      !form.reviewer_notes.trim()
    ) {
      return 'Explain the required corrections in Reviewer Notes.';
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch(
        `/api/projects/${encodeURIComponent(
          projectId
        )}/qa`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const result =
        (await response.json()) as QAResponse;

      if (!response.ok || !result.qa_review) {
        throw new Error(
          result.error || 'Unable to save the QA review.'
        );
      }

      setReview(result.qa_review);
      setForm(mapReviewToForm(result.qa_review));
      setSuccessMessage(
        `QA review saved as ${form.overall_status}.`
      );

      await fetchReview();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to save the QA review.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center text-center">
        <LoaderCircle
          className="h-7 w-7 animate-spin text-brand-green"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm text-gray-500">
          Loading QA review...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
            <Shield
              className="h-5 w-5 text-brand-green"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {review
                ? `Current status: ${
                    form.overall_status || 'Pending'
                  }`
                : 'No QA review has been saved'}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Final deliverables require an approved QA
              review before release.
            </p>

            {review && (
              <p className="mt-2 text-xs text-gray-500">
                Last updated{' '}
                {formatDate(
                  review.updated_at ||
                    review.created_at
                )}
                {review.updated_by_name
                  ? ` by ${review.updated_by_name}`
                  : review.reviewed_by_name
                    ? ` by ${review.reviewed_by_name}`
                    : ''}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => void fetchReview()}
          disabled={isSaving}
        >
          <RefreshCw
            className="mr-2 h-4 w-4"
            aria-hidden="true"
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              QA review could not be saved
            </p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
        >
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              QA review saved
            </p>

            <p className="mt-1 text-sm">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Textarea
          label="Structure Review"
          value={form.structure_review}
          onChange={(event) =>
            updateField(
              'structure_review',
              event.target.value
            )
          }
          placeholder="Review project organization, sections, flow, and completeness."
          rows={4}
          disabled={isCompleted || isSaving}
        />

        <Textarea
          label="Formatting Review"
          value={form.formatting_review}
          onChange={(event) =>
            updateField(
              'formatting_review',
              event.target.value
            )
          }
          placeholder="Review layout, typography, headings, spacing, and required style."
          rows={4}
          disabled={isCompleted || isSaving}
        />

        <Textarea
          label="Citation Review"
          value={form.citation_review}
          onChange={(event) =>
            updateField(
              'citation_review',
              event.target.value
            )
          }
          placeholder="Review citations, references, attribution, and citation style."
          rows={4}
          disabled={isCompleted || isSaving}
        />

        <Textarea
          label="Compliance Review"
          value={form.compliance_review}
          onChange={(event) =>
            updateField(
              'compliance_review',
              event.target.value
            )
          }
          placeholder="Review client requirements, academic standards, and institutional compliance."
          rows={4}
          disabled={isCompleted || isSaving}
        />
      </div>

      <Select
        label="Overall Status"
        value={form.overall_status}
        onChange={(event) =>
          updateField(
            'overall_status',
            event.target.value
          )
        }
        options={QA_STATUS_OPTIONS}
        disabled={isCompleted || isSaving}
      />

      <Textarea
        label="Reviewer Notes"
        value={form.reviewer_notes}
        onChange={(event) =>
          updateField(
            'reviewer_notes',
            event.target.value
          )
        }
        placeholder="Record corrections, approval details, or other QA observations."
        rows={4}
        disabled={isCompleted || isSaving}
      />

      {isCompleted ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          This project is completed. The QA review is
          read-only.
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? (
              <LoaderCircle
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save
                className="mr-2 h-4 w-4"
                aria-hidden="true"
              />
            )}

            {isSaving
              ? 'Saving Review...'
              : 'Save QA Review'}
          </Button>
        </div>
      )}
    </div>
  );
}