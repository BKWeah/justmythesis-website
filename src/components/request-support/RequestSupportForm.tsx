"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { AlertError } from "@/components/ui/Alert";
import { DocumentUpload, type FileWithPreview } from "./DocumentUpload";
import {
  supportRequestSchema,
  SERVICE_PACKAGES,
  type ClientFormData,
  type SupportRequestFormData,
} from "@/lib/validations/request-support";
import {
  PROJECT_STAGES,
  ACADEMIC_LEVELS,
  PRIORITY_LEVELS,
} from "@/lib/supabase/types";

// Form steps
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
  const [submitSuccess, setSubmitSuccess] = useState<{
    reference: string;
    message: string;
  } | null>(null);
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

    // Validate current step before proceeding
    if (currentStep === 1) {
      const isValid = await trigger([
        "email",
        "fullName",
        "phone",
        "institution",
      ]);
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

  const handleFilesChange = (files: FileWithPreview[]) => {
    setUploadedFiles(files);
  };

  const onSubmit = async (data: ClientFormData & SupportRequestFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/request-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      setClientId(result.clientId);
      setSubmitSuccess({
        reference: result.reference,
        message: `Thank you for submitting your request, ${data.fullName}! We will review your project and get back to you within 24-48 hours.`,
      });
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Request Submitted Successfully!
          </h2>
          <p className="text-lg text-gray-600 mb-6">{submitSuccess.message}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-2">Your Reference Number</p>
          <p className="text-2xl font-mono font-bold text-brand-green">
            {submitSuccess.reference}
          </p>
        </div>

        <div className="space-y-4 text-left bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900">What happens next?</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-medium">
                1
              </span>
              Our team will review your project details within 24-48 hours
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
              We will contact you via email or WhatsApp to discuss your project
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-medium">
                3
              </span>
              You will receive a detailed assessment and service recommendation
            </li>
          </ol>
        </div>

        <div className="mt-8">
          <Button
            variant="secondary"
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Request Support
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us about your thesis or research project. We will review your
          request and provide a personalized assessment and service
          recommendation within 24–48 hours.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Error Alert */}
        {submitError && (
          <div className="mb-6">
            <AlertError
              title="Submission Failed"
              dismissible
              onDismiss={() => setSubmitError(null)}
            >
              {submitError}
            </AlertError>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    step.id === currentStep && "cursor-default",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors",
                      step.id < currentStep
                        ? "bg-brand-green text-white"
                        : step.id === currentStep
                          ? "bg-brand-green text-white ring-4 ring-brand-green/20"
                          : "bg-gray-200 text-gray-500",
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden md:block text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.id === currentStep
                          ? "text-gray-900"
                          : "text-gray-500",
                      )}
                    >
                      {step.title}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "hidden md:block w-12 lg:w-20 h-0.5 mx-2",
                      step.id < currentStep ? "bg-brand-green" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Client Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Your Information
                </h3>
                <p className="text-sm text-gray-500">
                  Tell us how to reach you about your project.
                </p>
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="your.email@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone / WhatsApp"
                  type="tel"
                  placeholder="+231 77 123 4567"
                  hint="Include country code for WhatsApp contact"
                  {...register("phone")}
                />

                <Input
                  label="Institution"
                  placeholder="Your university or college"
                  {...register("institution")}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => goToStep(2)}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Project Details
                </h3>
                <p className="text-sm text-gray-500">
                  Help us understand your thesis project.
                </p>
              </div>

              <Input
                label="Working Title *"
                placeholder="e.g., Impact of Social Media on Academic Performance"
                error={errors.workingTitle?.message}
                {...register("workingTitle")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Academic Level *"
                  options={ACADEMIC_LEVELS.map((level) => ({
                    value: level,
                    label: level,
                  }))}
                  placeholder="Select your level"
                  error={errors.academicLevel?.message}
                  {...register("academicLevel")}
                />

                <Select
                  label="Current Project Stage *"
                  options={PROJECT_STAGES.map((stage) => ({
                    value: stage,
                    label: stage,
                  }))}
                  placeholder="Where are you now?"
                  error={errors.currentStage?.message}
                  {...register("currentStage")}
                />
              </div>

              {/* Service Package Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Package *
                </label>
                <div className="space-y-3">
                  {SERVICE_PACKAGES.map((pkg) => (
                    <label
                      key={pkg.value}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
                        watchedValues.requestedService === pkg.value
                          ? "border-brand-green bg-brand-green/5"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <input
                        type="radio"
                        value={pkg.value}
                        className="mt-1"
                        {...register("requestedService")}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{pkg.label}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {pkg.description}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {pkg.deliverables.slice(0, 4).map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-gray-500 flex items-center gap-1"
                            >
                              <Check className="h-3 w-3 text-brand-green" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.requestedService && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.requestedService.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Submission Deadline"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  {...register("submissionDeadline")}
                />

                <Select
                  label="Priority Level *"
                  options={PRIORITY_LEVELS}
                  error={errors.priority?.message}
                  {...register("priority")}
                />
              </div>

              <Textarea
                label="Describe Your Project *"
                placeholder="Tell us about your thesis topic, what you've accomplished so far, and what specific help you need..."
                rows={5}
                error={errors.supportDescription?.message}
                {...register("supportDescription")}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToStep(1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button type="button" onClick={() => goToStep(3)}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Upload Documents
                </h3>
                <p className="text-sm text-gray-500">
                  Share relevant documents to help us understand your project
                  better.
                </p>
              </div>

              <DocumentUpload
                clientId={clientId || "temp"}
                watch={watch as any}
                setValue={setValue as any}
                onUploadComplete={handleFilesChange}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToStep(2)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button type="button" onClick={() => goToStep(4)}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Review Your Request
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please review your information before submitting.
                  </p>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {watchedValues.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {watchedValues.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">
                        {watchedValues.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Institution</p>
                      <p className="font-medium text-gray-900">
                        {watchedValues.institution || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Project Title</p>
                        <p className="font-medium text-gray-900">
                          {watchedValues.workingTitle}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Academic Level</p>
                        <p className="font-medium text-gray-900">
                          {watchedValues.academicLevel}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Stage</p>
                        <p className="font-medium text-gray-900">
                          {watchedValues.currentStage}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Service Package</p>
                        <p className="font-medium text-gray-900">
                          {watchedValues.requestedService}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-500 text-sm mb-1">
                      Project Description
                    </p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {watchedValues.supportDescription}
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-500 text-sm mb-2">
                        Documents ({uploadedFiles.length})
                      </p>
                      <ul className="space-y-1">
                        {uploadedFiles.map((file) => (
                          <li
                            key={file.id}
                            className="text-sm text-gray-700 flex items-center gap-2"
                          >
                            <Check className="h-4 w-4 text-brand-green" />
                            {file.file.name} ({file.category})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Terms Notice */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">
                    Important Notice
                  </p>
                  <p>
                    By submitting this request, you confirm that you will remain
                    responsible for conducting your own surveys, interviews,
                    data collection, and final submission. JUSTmyTHESIS™ does
                    not fabricate research data or academic content.
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToStep(3)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
