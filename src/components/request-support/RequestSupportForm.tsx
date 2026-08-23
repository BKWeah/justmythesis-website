"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";

import { AlertError } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import {
  supportRequestSchema,
  SERVICE_PACKAGES,
  type ClientFormData,
  type SupportRequestFormData,
} from "@/lib/validations/request-support";
import {
  ACADEMIC_LEVELS,
  PRIORITY_LEVELS,
  PROJECT_STAGES,
} from "@/lib/supabase/types";
import { DocumentUpload, type FileWithPreview } from "./DocumentUpload";

const STEPS = [
  { id: 1, title: "Your Information", description: "Contact details" },
  { id: 2, title: "Project Details", description: "About your thesis" },
  { id: 3, title: "Documents", description: "Upload files (optional)" },
  { id: 4, title: "Review & Submit", description: "Confirm your request" },
];

export function RequestSupportForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ reference: string; message: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ClientFormData & SupportRequestFormData>({
    resolver: zodResolver(supportRequestSchema) as any,
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      institution: "",
      workingTitle: "",
      academicLevel: undefined,
      currentStage: "",
      requestedService: "",
      submissionDeadline: "",
      priority: "Normal",
      supportDescription: "",
    },
    mode: "onBlur",
  });

  const watchedValues = watch();

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }

    if (currentStep === 1) {
      const isValid = await trigger(["email", "fullName", "phone", "institution"]);
      if (isValid) setCurrentStep(step);
    } else if (currentStep === 2) {
      const isValid = await trigger([
        "workingTitle",
        "academicLevel",
        "currentStage",
        "requestedService",
        "priority",
        "supportDescription",
      ]);
      if (isValid) setCurrentStep(step);
    } else {
      setCurrentStep(step);
    }
  };

  const onSubmit = async (data: ClientFormData & SupportRequestFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/request-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit request");

      setClientId(result.clientId);
      setSubmitSuccess({
        reference: result.reference,
        message: `Thank you for submitting your request, ${data.fullName}! We will review your project and get back to you within 24-48 hours.`,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center sm:py-12">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-100">
            <Check className="h-8 w-8 text-green-700" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Request submitted successfully</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">{submitSuccess.message}</p>

          <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Reference number</p>
            <p className="mt-2 font-mono text-xl font-semibold text-brand-green sm:text-2xl">{submitSuccess.reference}</p>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-white p-5 text-left">
            <h3 className="font-semibold text-[var(--text-primary)]">What happens next?</h3>
            <ol className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
              {["Our team reviews your project details within 24-48 hours", "We contact you by email or WhatsApp to discuss your project", "You receive a detailed assessment and service recommendation"].map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-semibold text-white">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <Button
            variant="secondary"
            className="mt-7"
            onClick={() => {
              setSubmitSuccess(null);
              setCurrentStep(1);
              setUploadedFiles([]);
              reset();
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green">Scholar Haven Support</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">Request Support</h1>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
          Tell us about your thesis or research project. We will review your request and provide a personalized assessment and service recommendation within 24–48 hours.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        {submitError && (
          <div className="mb-6">
            <AlertError title="Submission Failed" dismissible onDismiss={() => setSubmitError(null)}>{submitError}</AlertError>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={step.id > currentStep}
                className={cn(
                  "rounded-xl px-2 py-3 text-center transition sm:px-3",
                  step.id === currentStep
                    ? "bg-brand-green text-white shadow-sm"
                    : step.id < currentStep
                      ? "bg-brand-green/10 text-brand-green"
                      : "bg-[var(--surface-subtle)] text-[var(--text-muted)]"
                )}
              >
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-semibold">
                  {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span className="mt-2 hidden text-xs font-semibold md:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <section className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Information</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Tell us how to reach you about your project.</p>
              </div>
              <Input label="Email Address *" type="email" placeholder="your.email@example.com" error={errors.email?.message} {...register("email")} />
              <Input label="Full Name *" placeholder="Enter your full name" error={errors.fullName?.message} {...register("fullName")} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Phone / WhatsApp" type="tel" placeholder="+231 77 123 4567" hint="Include country code for WhatsApp contact" {...register("phone")} />
                <Input label="Institution" placeholder="Your university or college" {...register("institution")} />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => goToStep(2)}>Continue<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Project Details</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Help us understand your thesis project.</p>
              </div>
              <Input label="Working Title *" placeholder="e.g., Impact of Social Media on Academic Performance" error={errors.workingTitle?.message} {...register("workingTitle")} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select label="Academic Level *" options={ACADEMIC_LEVELS.map((level) => ({ value: level, label: level }))} placeholder="Select your level" error={errors.academicLevel?.message} {...register("academicLevel")} />
                <Select label="Current Project Stage *" options={PROJECT_STAGES.map((stage) => ({ value: stage, label: stage }))} placeholder="Where are you now?" error={errors.currentStage?.message} {...register("currentStage")} />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-[var(--text-primary)]">Service Package *</label>
                <div className="space-y-3">
                  {SERVICE_PACKAGES.map((pkg) => (
                    <label
                      key={pkg.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition",
                        watchedValues.requestedService === pkg.value
                          ? "border-brand-green bg-brand-green/5 ring-1 ring-brand-green/10"
                          : "border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-subtle)]"
                      )}
                    >
                      <input type="radio" value={pkg.value} className="mt-1" {...register("requestedService")} />
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text-primary)]">{pkg.label}</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{pkg.description}</p>
                        <ul className="mt-3 space-y-1.5">
                          {pkg.deliverables.slice(0, 4).map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <Check className="h-3.5 w-3.5 text-brand-green" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.requestedService && <p className="mt-2 text-sm text-red-600">{errors.requestedService.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Submission Deadline" type="date" min={new Date().toISOString().split("T")[0]} {...register("submissionDeadline")} />
                <Select label="Priority Level *" options={PRIORITY_LEVELS} error={errors.priority?.message} {...register("priority")} />
              </div>
              <Textarea label="Describe Your Project *" placeholder="Tell us about your thesis topic, what you've accomplished so far, and what specific help you need..." rows={5} error={errors.supportDescription?.message} {...register("supportDescription")} />
              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => goToStep(1)}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
                <Button type="button" onClick={() => goToStep(3)}>Continue<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upload Documents</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Share relevant documents to help us understand your project better.</p>
              </div>
              <DocumentUpload clientId={clientId || "temp"} watch={watch as any} setValue={setValue as any} onUploadComplete={setUploadedFiles} />
              <div className="flex justify-between gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => goToStep(2)}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
                <Button type="button" onClick={() => goToStep(4)}>Continue<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <section className="space-y-6 rounded-2xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Review Your Request</h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Please review your information before submitting.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Name", watchedValues.fullName],
                    ["Email", watchedValues.email],
                    ["Phone", watchedValues.phone || "Not provided"],
                    ["Institution", watchedValues.institution || "Not provided"],
                    ["Project Title", watchedValues.workingTitle],
                    ["Academic Level", watchedValues.academicLevel],
                    ["Current Stage", watchedValues.currentStage],
                    ["Service Package", watchedValues.requestedService],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                      <p className="mt-1 break-words text-sm font-semibold text-[var(--text-primary)]">{String(value || "Not provided")}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Project Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">{watchedValues.supportDescription}</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="rounded-xl border border-[var(--border-subtle)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Documents ({uploadedFiles.length})</p>
                    <ul className="mt-3 space-y-2">
                      {uploadedFiles.map((file) => (
                        <li key={file.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                          <Check className="h-4 w-4 text-brand-green" />
                          <span className="break-all">{file.file.name} ({file.category})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Important Notice</p>
                  <p className="mt-2 leading-6">By submitting this request, you confirm that you will remain responsible for conducting your own surveys, interviews, data collection, and final submission. JUSTmyTHESIS™ does not fabricate research data or academic content.</p>
                </div>
              </section>

              <div className="flex justify-between gap-3">
                <Button type="button" variant="ghost" onClick={() => goToStep(3)}><ChevronLeft className="mr-1 h-4 w-4" />Back</Button>
                <Button type="submit" isLoading={isSubmitting}><GraduationCap className="mr-2 h-4 w-4" />Submit Request</Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
