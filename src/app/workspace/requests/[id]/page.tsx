"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { OperationsGPTCard } from "@/components/operations-gpt";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bot,
  Building,
  CheckCircle,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Send,
  User,
} from "lucide-react";
import { formatDate, formatDistanceToNow } from "@/lib/utils/date";

type TabId =
  | "overview"
  | "client"
  | "documents"
  | "assessment"
  | "recommendation"
  | "notes"
  | "activity";

type AssessmentStatus = "Draft" | "Completed";
type RiskLevel = "Low" | "Medium" | "High";
type RecommendationStatus =
  "Draft" | "Approved Internally" | "Sent to Client" | "Accepted" | "Rejected";

const STATUS_OPTIONS = [
  { value: "New Request", label: "New Request" },
  { value: "Under Review", label: "Under Review" },
  { value: "Waiting for Documents", label: "Waiting for Documents" },
  { value: "Ready for Assessment", label: "Ready for Assessment" },
  { value: "Assessment Complete", label: "Assessment Complete" },
  { value: "Recommendation Sent", label: "Recommendation Sent" },
  {
    value: "Waiting for Client Decision",
    label: "Waiting for Client Decision",
  },
  { value: "Approved", label: "Approved" },
  { value: "Declined", label: "Declined" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Project Activated", label: "Project Activated" },
];

const RISK_OPTIONS = [
  { value: "", label: "Select risk level" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const ASSESSMENT_STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Completed", label: "Completed" },
];

const RECOMMENDATION_STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Approved Internally", label: "Approved Internally" },
  { value: "Sent to Client", label: "Sent to Client" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
];

function calculateProjectDeadline(startDate: string, timeline: string): string {
  if (!startDate || !timeline) return "";

  const match = timeline
    .trim()
    .toLowerCase()
    .match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);

  if (!match) return "";

  const amount = Number.parseFloat(match[1]);
  const unit = match[2];
  const date = new Date(`${startDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "";

  if (unit.startsWith("day")) {
    date.setDate(date.getDate() + amount);
  } else if (unit.startsWith("week")) {
    date.setDate(date.getDate() + amount * 7);
  } else if (unit.startsWith("month")) {
    date.setMonth(date.getMonth() + amount);
  }

  return date.toISOString().split("T")[0];
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "error" | "info"
  > = {
    "New Request": "info",
    "Under Review": "warning",
    "Waiting for Documents": "warning",
    "Ready for Assessment": "info",
    "Assessment Complete": "success",
    "Recommendation Sent": "info",
    "Waiting for Client Decision": "warning",
    Approved: "success",
    Declined: "error",
    Cancelled: "error",
    "Project Activated": "info",
  };

  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
}

function SectionCard({
  title,
  icon,
  children,
  actions,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand-green/10 p-2 text-brand-green">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>

        {actions ? <div>{actions}</div> : null}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
    updateStatus,
    saveAssessment,
    updateAssessment,
    saveRecommendation,
    updateRecommendation,
    addNote,
    convertToProject,
  } = useRequestDetail(id);

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Under Review");
  const [newNote, setNewNote] = useState("");
  const [clientFeedback, setClientFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isAnalyzingAssessment, setIsAnalyzingAssessment] = useState(false);
  const [operationsGPTStatus, setOperationsGPTStatus] = useState<
    "idle" | "success" | "warning" | "error"
  >("idle");
  const [operationsGPTMessage, setOperationsGPTMessage] = useState<
    string | null
  >(null);
  const [operationsGPTStep, setOperationsGPTStep] = useState<
    string | undefined
  >(undefined);

  const [assessmentForm, setAssessmentForm] = useState<{
    current_project_stage: string;
    completion_estimate: string;
    risk_level: "" | RiskLevel;
    strengths: string;
    weaknesses: string;
    missing_requirements: string;
    compliance_issues: string;
    assessment_summary: string;
    status: AssessmentStatus;
  }>({
    current_project_stage: "",
    completion_estimate: "",
    risk_level: "",
    strengths: "",
    weaknesses: "",
    missing_requirements: "",
    compliance_issues: "",
    assessment_summary: "",
    status: "Draft",
  });

  const [recommendationForm, setRecommendationForm] = useState({
    recommended_service: "",
    recommended_timeline: "",
    recommended_fee: "",
    payment_structure: "",
    roadmap_summary: "",
    recommendation_summary: "",
    status: "Draft" as RecommendationStatus,
  });

  const [projectForm, setProjectForm] = useState({
    project_title: "",
    start_date: "",
    deadline: "",
    service_package: "",
    payment_structure: "",
    estimated_cost: "",
  });

  useEffect(() => {
    if (!data) return;

    setSelectedStatus(data.status || "Under Review");

    setAssessmentForm({
      current_project_stage:
        data.assessment?.current_project_stage || data.current_stage || "",
      completion_estimate: data.assessment?.completion_estimate || "",
      risk_level: data.assessment?.risk_level || "",
      strengths: data.assessment?.strengths || "",
      weaknesses: data.assessment?.weaknesses || "",
      missing_requirements: data.assessment?.missing_requirements || "",
      compliance_issues: data.assessment?.compliance_issues || "",
      assessment_summary: data.assessment?.assessment_summary || "",
      status: data.assessment?.status || "Draft",
    });

    setRecommendationForm({
      recommended_service: data.recommendation?.recommended_service || "",
      recommended_timeline: data.recommendation?.recommended_timeline || "",
      recommended_fee: data.recommendation?.recommended_fee?.toString() || "",
      payment_structure: data.recommendation?.payment_structure || "",
      roadmap_summary: data.recommendation?.roadmap_summary || "",
      recommendation_summary: data.recommendation?.recommendation_summary || "",
      status: data.recommendation?.status || "Draft",
    });

    setProjectForm((previous) => ({
      ...previous,
      project_title: data.working_title || "",
      service_package:
        data.recommendation?.recommended_service || data.requested_service || "",
      payment_structure: data.recommendation?.payment_structure || "",
      estimated_cost: data.recommendation?.recommended_fee?.toString() || "",
      deadline: "",
    }));
  }, [data]);

  const clearMessages = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  const handleStatusChange = async () => {
    clearMessages();
    setIsSubmitting(true);

    try {
      await updateStatus(selectedStatus);
      setShowStatusModal(false);
      setActionSuccess("Request status updated successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update status.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeAssessment = async () => {
    clearMessages();
    setIsAnalyzingAssessment(true);
    setOperationsGPTStatus("idle");
    setOperationsGPTMessage(null);
    setOperationsGPTStep("Preparing assessment...");

    try {
      const response = await fetch("/api/operations-gpt/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Operations GPT failed to analyze the request.",
        );
      }

      const generated = result.assessment;

      setAssessmentForm((previous) => ({
        ...previous,
        current_project_stage:
          generated.current_project_stage || previous.current_project_stage,
        completion_estimate:
          generated.completion_estimate || previous.completion_estimate,
        risk_level: generated.risk_level || previous.risk_level,
        strengths: generated.strengths || previous.strengths,
        weaknesses: generated.weaknesses || previous.weaknesses,
        missing_requirements:
          generated.missing_requirements || previous.missing_requirements,
        compliance_issues:
          generated.compliance_issues || previous.compliance_issues,
        assessment_summary:
          generated.assessment_summary || previous.assessment_summary,
        status: "Draft",
      }));

      setOperationsGPTStatus("success");
      setOperationsGPTMessage(
        result.notice ||
          "Assessment draft generated. Review and edit it before saving.",
      );
    } catch (err) {
      setOperationsGPTStatus("error");
      setOperationsGPTMessage(
        err instanceof Error
          ? err.message
          : "Operations GPT failed to generate the assessment.",
      );
    } finally {
      setOperationsGPTStep(undefined);
      setIsAnalyzingAssessment(false);
    }
  };

  const handleSaveAssessment = async () => {
    clearMessages();

    if (!assessmentForm.current_project_stage.trim()) {
      setActionError("Current project stage is required.");
      return;
    }

    if (!assessmentForm.completion_estimate.trim()) {
      setActionError("Completion estimate is required.");
      return;
    }

    if (!assessmentForm.risk_level) {
      setActionError("Risk level is required.");
      return;
    }

    if (!assessmentForm.assessment_summary.trim()) {
      setActionError("Assessment summary is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        current_project_stage: assessmentForm.current_project_stage,
        completion_estimate: assessmentForm.completion_estimate,
        risk_level: assessmentForm.risk_level,
        strengths: assessmentForm.strengths,
        weaknesses: assessmentForm.weaknesses,
        missing_requirements: assessmentForm.missing_requirements,
        compliance_issues: assessmentForm.compliance_issues,
        assessment_summary: assessmentForm.assessment_summary,
        status: assessmentForm.status,
      };

      if (data?.assessment) {
        await updateAssessment(payload);
      } else {
        await saveAssessment(payload);
      }

      setActionSuccess(
        assessmentForm.status === "Completed"
          ? "Assessment completed successfully."
          : "Assessment draft saved successfully.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save assessment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRecommendation = async (status: RecommendationStatus) => {
    clearMessages();

    if (!recommendationForm.recommended_service.trim()) {
      setActionError("Recommended service is required.");
      return;
    }

    if (!recommendationForm.recommended_timeline.trim()) {
      setActionError("Recommended timeline is required.");
      return;
    }

    if (!recommendationForm.recommended_fee.trim()) {
      setActionError("Recommended fee is required.");
      return;
    }

    if (!recommendationForm.payment_structure.trim()) {
      setActionError("Payment structure is required.");
      return;
    }

    if (!recommendationForm.recommendation_summary.trim()) {
      setActionError("Recommendation summary is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        recommended_service: recommendationForm.recommended_service,
        recommended_timeline: recommendationForm.recommended_timeline,
        recommended_fee: Number.parseFloat(recommendationForm.recommended_fee),
        payment_structure: recommendationForm.payment_structure,
        roadmap_summary: recommendationForm.roadmap_summary,
        recommendation_summary: recommendationForm.recommendation_summary,
        status,
      };

      if (data?.recommendation) {
        await updateRecommendation(payload, status);
      } else {
        await saveRecommendation(payload, status);
      }

      setRecommendationForm((previous) => ({ ...previous, status }));
      setActionSuccess(
        status === "Draft"
          ? "Recommendation draft saved successfully."
          : status === "Approved Internally"
            ? "Recommendation approved internally."
            : status === "Sent to Client"
              ? "Recommendation marked as sent to client."
              : "Recommendation updated successfully.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save recommendation.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientDecision = async (status: "Accepted" | "Rejected") => {
    clearMessages();

    if (!data?.recommendation) {
      setActionError("Save the recommendation before recording a client decision.");
      return;
    }

    if (status === "Rejected" && !clientFeedback.trim()) {
      setActionError("Client feedback is required when recording a rejection.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        recommended_service: recommendationForm.recommended_service,
        recommended_timeline: recommendationForm.recommended_timeline,
        recommended_fee: Number.parseFloat(recommendationForm.recommended_fee),
        payment_structure: recommendationForm.payment_structure,
        roadmap_summary: recommendationForm.roadmap_summary,
        recommendation_summary: recommendationForm.recommendation_summary,
        status,
        client_feedback: status === "Rejected" ? clientFeedback.trim() : null,
      };

      await updateRecommendation(payload, status);

      setRecommendationForm((previous) => ({ ...previous, status }));
      setShowRejectModal(false);
      setClientFeedback("");
      setActionSuccess(
        status === "Accepted"
          ? "Client acceptance recorded successfully."
          : "Client rejection recorded successfully.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to record the client decision.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    clearMessages();

    if (!newNote.trim()) return;

    setIsSubmitting(true);

    try {
      await addNote(newNote.trim());
      setNewNote("");
      setShowNoteModal(false);
      setActionSuccess("Internal note added successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to add note.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToProject = async () => {
    clearMessages();

    if (!projectForm.project_title.trim()) {
      setActionError("Project title is required.");
      return;
    }

    if (!projectForm.start_date) {
      setActionError("Start date is required.");
      return;
    }

    if (!projectForm.deadline) {
      setActionError("Project deadline is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await convertToProject({
        project_title: projectForm.project_title,
        start_date: projectForm.start_date,
        deadline: projectForm.deadline,
        service_package:
          projectForm.service_package || data?.requested_service || "",
        payment_structure: projectForm.payment_structure,
        estimated_cost: parseFloat(projectForm.estimated_cost) || 0,
      });

      if (result.project?.id) {
        router.push(`/workspace/projects/${result.project.id}`);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to convert request to project.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/workspace/requests">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>

        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Error Loading Request"
          description={error || "Request not found"}
        />
      </div>
    );
  }

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: "overview", label: "Overview", icon: <FileText className="h-4 w-4" /> },
    { id: "client", label: "Client", icon: <User className="h-4 w-4" /> },
    { id: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
    { id: "assessment", label: "Assessment", icon: <CheckCircle className="h-4 w-4" /> },
    { id: "recommendation", label: "Recommendation", icon: <Send className="h-4 w-4" /> },
    { id: "notes", label: "Notes", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "activity", label: "Activity Log", icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {actionSuccess}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workspace/requests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.request_reference}
              </h1>
              <StatusBadge status={data.status} />
            </div>

            <p className="mt-1 text-gray-500">
              {data.working_title || "Untitled Request"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
            Change Status
          </Button>

          <Button
            onClick={() => setShowConvertModal(true)}
            disabled={data.recommendation?.status !== "Accepted"}
            title={
              data.recommendation?.status === "Accepted"
                ? "Convert this accepted request to a project"
                : "Project conversion becomes available after client acceptance"
            }
          >
            Convert to Project
          </Button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                clearMessages();
              }}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Request Details"
            icon={<FileText className="h-5 w-5" />}
          >
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Request Reference</dt>
                <dd className="font-mono font-medium text-brand-green">
                  {data.request_reference}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Priority</dt>
                <dd>
                  <Badge
                    variant={
                      data.priority === "Urgent"
                        ? "error"
                        : data.priority === "High"
                          ? "warning"
                          : "default"
                    }
                  >
                    {data.priority}
                  </Badge>
                </dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Requested Service</dt>
                <dd className="font-medium">{data.requested_service}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Current Stage</dt>
                <dd>{data.current_stage || "-"}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Academic Level</dt>
                <dd>{data.academic_level || "-"}</dd>
              </div>

              <div>
                <dt className="text-sm text-gray-500">Submission Date</dt>
                <dd>{formatDate(data.created_at)}</dd>
              </div>

              {data.submission_deadline ? (
                <div>
                  <dt className="text-sm text-gray-500">Deadline</dt>
                  <dd>{formatDate(data.submission_deadline)}</dd>
                </div>
              ) : null}
            </dl>
          </SectionCard>

          <SectionCard title="Operations GPT" icon={<Bot className="h-5 w-5" />}>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 rounded-full bg-brand-green/10 p-4">
                <Bot className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Analyze Request</h3>
              <p className="mb-4 max-w-sm text-sm text-gray-500">
                Operations GPT will later analyze the request and prepare an
                assessment draft for staff review.
              </p>
              <Button disabled>Coming Soon</Button>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === "client" ? (
        <SectionCard title="Client Information" icon={<User className="h-5 w-5" />}>
          <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" /> Full Name
              </dt>
              <dd className="font-medium">{data.clients?.full_name || "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" /> Email
              </dt>
              <dd>{data.clients?.email || "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" /> Phone
              </dt>
              <dd>{data.clients?.phone || "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <Building className="h-4 w-4" /> Institution
              </dt>
              <dd>{data.clients?.institution || "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <GraduationCap className="h-4 w-4" /> Programme
              </dt>
              <dd>{data.clients?.programme || "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                <GraduationCap className="h-4 w-4" /> Degree Level
              </dt>
              <dd>
                {data.clients?.degree_level ||
                  data.clients?.academic_level ||
                  data.academic_level ||
                  "-"}
              </dd>
            </div>
          </dl>
        </SectionCard>
      ) : null}

      {activeTab === "documents" ? (
        <SectionCard title="Documents" icon={<FileText className="h-5 w-5" />}>
          {data.documents?.length ? (
            <div className="space-y-3">
              {data.documents.map((document) => (
                <div key={document.id} className="rounded-lg bg-gray-50 p-3">
                  <p className="font-medium text-gray-900">{document.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {document.category || "Document"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">No documents uploaded</p>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "assessment" ? (
        <div className="space-y-6">
          <OperationsGPTCard
            title="Operations GPT Assessment"
            description="Analyze the request, client information and submitted documents to prepare a draft assessment for staff review."
            buttonLabel="Analyze with Operations GPT"
            loadingLabel="Analyzing Request..."
            isLoading={isAnalyzingAssessment}
            disabled={isSubmitting}
            status={operationsGPTStatus}
            statusMessage={operationsGPTMessage || undefined}
            currentStep={operationsGPTStep}
            onAnalyze={handleAnalyzeAssessment}
          />

          <SectionCard
            title="Assessment"
            icon={<CheckCircle className="h-5 w-5" />}
            actions={
              data.assessment ? (
                <Badge variant={data.assessment.status === "Completed" ? "success" : "warning"}>
                  {data.assessment.status}
                </Badge>
              ) : null
            }
          >
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  Review and edit the Operations GPT draft or complete the
                  assessment manually. Save it as a draft until it is ready to
                  be completed.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Current Project Stage *"
                  value={assessmentForm.current_project_stage}
                  onChange={(event) =>
                    setAssessmentForm((previous) => ({
                      ...previous,
                      current_project_stage: event.target.value,
                    }))
                  }
                  placeholder="e.g., Topic approved, proposal started"
                />

                <Input
                  label="Estimated Completion Time *"
                  value={assessmentForm.completion_estimate}
                  onChange={(event) =>
                    setAssessmentForm((previous) => ({
                      ...previous,
                      completion_estimate: event.target.value,
                    }))
                  }
                  placeholder="e.g., 6 weeks"
                />

                <Select
                  label="Risk Level *"
                  value={assessmentForm.risk_level}
                  options={RISK_OPTIONS}
                  onChange={(event) =>
                    setAssessmentForm((previous) => ({
                      ...previous,
                      risk_level: event.target.value as "" | RiskLevel,
                    }))
                  }
                />

                <Select
                  label="Assessment Status *"
                  value={assessmentForm.status}
                  options={ASSESSMENT_STATUS_OPTIONS}
                  onChange={(event) =>
                    setAssessmentForm((previous) => ({
                      ...previous,
                      status: event.target.value as AssessmentStatus,
                    }))
                  }
                />
              </div>

              <Textarea
                label="Strengths"
                value={assessmentForm.strengths}
                onChange={(event) =>
                  setAssessmentForm((previous) => ({
                    ...previous,
                    strengths: event.target.value,
                  }))
                }
                placeholder="Identify the strengths of the request, topic, available materials, or client preparation."
                rows={4}
              />

              <Textarea
                label="Weaknesses"
                value={assessmentForm.weaknesses}
                onChange={(event) =>
                  setAssessmentForm((previous) => ({
                    ...previous,
                    weaknesses: event.target.value,
                  }))
                }
                placeholder="Identify weaknesses, limitations, or areas requiring improvement."
                rows={4}
              />

              <Textarea
                label="Missing Requirements"
                value={assessmentForm.missing_requirements}
                onChange={(event) =>
                  setAssessmentForm((previous) => ({
                    ...previous,
                    missing_requirements: event.target.value,
                  }))
                }
                placeholder="List missing documents, information, approvals, datasets, guidelines, or requirements."
                rows={4}
              />

              <Textarea
                label="Compliance Issues"
                value={assessmentForm.compliance_issues}
                onChange={(event) =>
                  setAssessmentForm((previous) => ({
                    ...previous,
                    compliance_issues: event.target.value,
                  }))
                }
                placeholder="List institutional, ethical, methodological, formatting, or academic compliance concerns."
                rows={4}
              />

              <Textarea
                label="Assessment Summary *"
                value={assessmentForm.assessment_summary}
                onChange={(event) =>
                  setAssessmentForm((previous) => ({
                    ...previous,
                    assessment_summary: event.target.value,
                  }))
                }
                placeholder="Provide the overall assessment, feasibility judgment, expected effort, and recommended next step."
                rows={6}
              />

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Operations GPT only prepares a draft. A staff member must
                  review and save the final assessment.
                </p>

                <Button
                  onClick={handleSaveAssessment}
                  disabled={isSubmitting || isAnalyzingAssessment}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting
                    ? "Saving..."
                    : assessmentForm.status === "Completed"
                      ? "Complete Assessment"
                      : "Save Draft"}
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === "recommendation" ? (
        <div className="space-y-6">
          <OperationsGPTCard
            title="Operations GPT Recommendation"
            description="Prepare a recommendation draft from the completed assessment, request details and available documents."
            buttonLabel="Generate with Operations GPT"
            disabled
            status="warning"
            statusMessage="Operations GPT recommendation generation will be activated after the intelligence package and provider are configured."
            onAnalyze={() => undefined}
          />

          <SectionCard
            title="Recommendation"
            icon={<Send className="h-5 w-5" />}
            actions={
              data.recommendation ? (
                <Badge
                  variant={
                    data.recommendation.status === "Sent to Client" ||
                    data.recommendation.status === "Accepted"
                      ? "success"
                      : data.recommendation.status === "Rejected"
                        ? "error"
                        : "warning"
                  }
                >
                  {data.recommendation.status}
                </Badge>
              ) : null
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Recommended Service *"
                  value={recommendationForm.recommended_service}
                  onChange={(event) =>
                    setRecommendationForm((previous) => ({
                      ...previous,
                      recommended_service: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Recommended Timeline *"
                  value={recommendationForm.recommended_timeline}
                  onChange={(event) =>
                    setRecommendationForm((previous) => ({
                      ...previous,
                      recommended_timeline: event.target.value,
                    }))
                  }
                  placeholder="e.g., 6 weeks"
                />

                <Input
                  label="Recommended Fee *"
                  type="number"
                  value={recommendationForm.recommended_fee}
                  onChange={(event) =>
                    setRecommendationForm((previous) => ({
                      ...previous,
                      recommended_fee: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                />

                <Input
                  label="Payment Structure *"
                  value={recommendationForm.payment_structure}
                  onChange={(event) =>
                    setRecommendationForm((previous) => ({
                      ...previous,
                      payment_structure: event.target.value,
                    }))
                  }
                  placeholder="e.g., 50% upfront, 50% on completion"
                />

                <Select
                  label="Recommendation Status"
                  value={recommendationForm.status}
                  options={RECOMMENDATION_STATUS_OPTIONS}
                  onChange={(event) =>
                    setRecommendationForm((previous) => ({
                      ...previous,
                      status: event.target.value as RecommendationStatus,
                    }))
                  }
                />
              </div>

              <Textarea
                label="Roadmap Summary"
                value={recommendationForm.roadmap_summary}
                onChange={(event) =>
                  setRecommendationForm((previous) => ({
                    ...previous,
                    roadmap_summary: event.target.value,
                  }))
                }
                placeholder="Outline the proposed stages, major deliverables and expected sequence of work."
                rows={5}
              />

              <Textarea
                label="Recommendation Summary *"
                value={recommendationForm.recommendation_summary}
                onChange={(event) =>
                  setRecommendationForm((previous) => ({
                    ...previous,
                    recommendation_summary: event.target.value,
                  }))
                }
                placeholder="Provide the formal recommendation, rationale and next action for the client."
                rows={6}
              />

              <div className="space-y-4 border-t pt-4">
                {recommendationForm.status === "Sent to Client" ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    The recommendation has been sent. Record the client decision
                    below.
                  </div>
                ) : null}

                {recommendationForm.status === "Accepted" ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    The client accepted this recommendation. Project conversion
                    is now available.
                  </div>
                ) : null}

                {recommendationForm.status === "Rejected" ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    The client rejected this recommendation. Review the feedback
                    before taking another action.
                  </div>
                ) : null}

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleSaveRecommendation("Draft")}
                    disabled={isSubmitting}
                  >
                    Save Draft
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => handleSaveRecommendation("Approved Internally")}
                    disabled={
                      isSubmitting ||
                      recommendationForm.status === "Sent to Client" ||
                      recommendationForm.status === "Accepted"
                    }
                  >
                    Approve Internally
                  </Button>

                  <Button
                    onClick={() => handleSaveRecommendation("Sent to Client")}
                    disabled={
                      isSubmitting ||
                      recommendationForm.status !== "Approved Internally"
                    }
                  >
                    Send to Client
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => handleClientDecision("Accepted")}
                    disabled={
                      isSubmitting ||
                      recommendationForm.status !== "Sent to Client"
                    }
                  >
                    Record Client Acceptance
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => setShowRejectModal(true)}
                    disabled={
                      isSubmitting ||
                      recommendationForm.status !== "Sent to Client"
                    }
                  >
                    Record Client Rejection
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <SectionCard
          title="Internal Notes"
          icon={<MessageSquare className="h-5 w-5" />}
          actions={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowNoteModal(true)}
            >
              Add Note
            </Button>
          }
        >
          {data.notes?.length ? (
            <div className="space-y-4">
              {data.notes.map((note) => (
                <div key={note.id} className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900">
                      {note.author_name || "Staff"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(note.created_at)}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-600">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">No internal notes yet</p>
          )}
        </SectionCard>
      ) : null}

      {activeTab === "activity" ? (
        <SectionCard title="Activity Log" icon={<Activity className="h-5 w-5" />}>
          {data.activities?.length ? (
            <div className="space-y-4">
              {data.activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-green" />
                  <div>
                    <p className="text-gray-900">{activity.description}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.performer_name || "System"} ·{" "}
                      {formatDistanceToNow(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500">No activity recorded</p>
          )}
        </SectionCard>
      ) : null}

      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Status"
      >
        <Select
          label="New Status"
          value={selectedStatus}
          options={STATUS_OPTIONS}
          onChange={(event) => setSelectedStatus(event.target.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleStatusChange} disabled={isSubmitting}>
            Update Status
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        title="Convert to Project"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Project Title"
            value={projectForm.project_title}
            onChange={(event) =>
              setProjectForm((previous) => ({
                ...previous,
                project_title: event.target.value,
              }))
            }
          />

          <Input
            label="Start Date"
            type="date"
            value={projectForm.start_date}
            onChange={(event) => {
              const startDate = event.target.value;
              setProjectForm((previous) => ({
                ...previous,
                start_date: startDate,
                deadline: calculateProjectDeadline(
                  startDate,
                  data.recommendation?.recommended_timeline || "",
                ),
              }));
            }}
          />

          <Input
            label="Deadline"
            type="date"
            value={projectForm.deadline}
            onChange={(event) =>
              setProjectForm((previous) => ({
                ...previous,
                deadline: event.target.value,
              }))
            }
          />

          <Input
            label="Service Package"
            value={projectForm.service_package}
            onChange={(event) =>
              setProjectForm((previous) => ({
                ...previous,
                service_package: event.target.value,
              }))
            }
          />

          <Input
            label="Payment Structure"
            value={projectForm.payment_structure}
            onChange={(event) =>
              setProjectForm((previous) => ({
                ...previous,
                payment_structure: event.target.value,
              }))
            }
          />

          <Input
            label="Estimated Cost"
            type="number"
            value={projectForm.estimated_cost}
            onChange={(event) =>
              setProjectForm((previous) => ({
                ...previous,
                estimated_cost: event.target.value,
              }))
            }
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleConvertToProject} disabled={isSubmitting}>
            Create Project
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setClientFeedback("");
        }}
        title="Record Client Rejection"
      >
        <Textarea
          label="Client Feedback *"
          value={clientFeedback}
          onChange={(event) => setClientFeedback(event.target.value)}
          placeholder="Enter the client's reason for rejecting the recommendation."
          rows={5}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowRejectModal(false);
              setClientFeedback("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleClientDecision("Rejected")}
            disabled={isSubmitting || !clientFeedback.trim()}
          >
            Confirm Rejection
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Internal Note"
      >
        <Textarea
          label="Note"
          value={newNote}
          onChange={(event) => setNewNote(event.target.value)}
          placeholder="Enter a private note for the operations team."
          rows={5}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddNote}
            disabled={isSubmitting || !newNote.trim()}
          >
            Add Note
          </Button>
        </div>
      </Modal>
    </div>
  );
}
