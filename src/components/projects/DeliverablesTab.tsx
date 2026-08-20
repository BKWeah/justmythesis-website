"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Package,
  Star,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Deliverable {
  id: string;
  project_id: string;
  file_name: string;
  storage_path: string | null;
  file_type: string;
  file_size_bytes: number | null;
  delivery_notes: string | null;
  version_number: number;
  is_final: boolean;
  delivered_at: string | null;
  client_confirmed: boolean;
  client_confirmed_at: string | null;
  uploaded_by: string | null;
  released_by: string | null;
  uploaded_by_name?: string;
  released_by_name?: string | null;
  created_at: string;
  status?: "Draft" | "Released" | "Confirmed";
}

interface DeliverablesTabProps {
  projectId: string;
  isCompleted: boolean;
}

interface UploadForm {
  file: File | null;
  description: string;
  isFinal: boolean;
}

const initialForm: UploadForm = {
  file: null,
  description: "",
  isFinal: false,
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatus(deliverable: Deliverable) {
  if (deliverable.client_confirmed) return "Confirmed";
  if (deliverable.delivered_at) return "Released";
  return "Draft";
}

function getStatusVariant(status: string) {
  if (status === "Confirmed") return "success";
  if (status === "Released") return "info";
  return "default";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Could not read the selected file."));
        return;
      }

      const base64 = result.split(",")[1];

      if (!base64) {
        reject(new Error("Could not prepare the selected file."));
        return;
      }

      resolve(base64);
    };

    reader.onerror = () =>
      reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function readApiResponse(response: Response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.error || "The requested action failed.");
  }

  return result;
}

export default function DeliverablesTab({
  projectId,
  isCompleted,
}: DeliverablesTabProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchDeliverables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/deliverables`, {
        cache: "no-store",
      });

      const result = await readApiResponse(response);
      setDeliverables(result.deliverables || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load deliverables.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const closeUploadModal = () => {
    if (isSubmitting) return;
    setShowUploadModal(false);
    setUploadForm(initialForm);
    setError(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadForm((previous) => ({
      ...previous,
      file: event.target.files?.[0] || null,
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      setError("Select a file before uploading.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const fileData = await fileToBase64(uploadForm.file);
      const response = await fetch(`/api/projects/${projectId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadForm.file.name,
          fileType: uploadForm.file.type || "application/octet-stream",
          fileSize: uploadForm.file.size,
          fileData,
          description: uploadForm.description.trim() || null,
          isFinal: uploadForm.isFinal,
        }),
      });

      await readApiResponse(response);
      setShowUploadModal(false);
      setUploadForm(initialForm);
      await fetchDeliverables();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload deliverable.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const runAction = async (
    deliverableId: string,
    action: "release" | "withdraw" | "confirm" | "set_final",
  ) => {
    try {
      setIsSubmitting(true);
      setActiveDeliverableId(deliverableId);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/deliverables`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, deliverableId }),
      });

      await readApiResponse(response);
      await fetchDeliverables();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update deliverable.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveDeliverableId(null);
    }
  };

  const handleDownload = async (deliverable: Deliverable) => {
    try {
      setDownloadingId(deliverable.id);
      setError(null);

      const response = await fetch(
        `/api/projects/${projectId}/deliverables/download?deliverableId=${encodeURIComponent(
          deliverable.id,
        )}`,
        { cache: "no-store" },
      );

      const result = await readApiResponse(response);

      if (!result?.url) {
        throw new Error("Secure download link was not returned.");
      }

      const downloadWindow = window.open(
        result.url,
        "_blank",
        "noopener,noreferrer",
      );

      if (!downloadWindow) {
        window.location.assign(result.url);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download deliverable.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (deliverable: Deliverable) => {
    if (
      !window.confirm(
        `Delete Version ${deliverable.version_number}? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActiveDeliverableId(deliverable.id);
      setError(null);

      const response = await fetch(
        `/api/projects/${projectId}/deliverables?deliverableId=${deliverable.id}`,
        { method: "DELETE" },
      );

      await readApiResponse(response);
      await fetchDeliverables();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete deliverable.",
      );
    } finally {
      setIsSubmitting(false);
      setActiveDeliverableId(null);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-green" />
              <h2 className="text-lg font-semibold text-gray-900">
                Project Deliverables
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload, version, release, and track client deliverables.
            </p>
          </div>

          {!isCompleted && (
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setShowUploadModal(true);
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Deliverable
            </Button>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-14 text-center text-gray-500">
              Loading deliverables...
            </div>
          ) : deliverables.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-14 text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 font-medium text-gray-700">
                No deliverables uploaded
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Upload the first deliverable for this project.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliverables.map((deliverable) => {
                const status = getStatus(deliverable);
                const isActive =
                  isSubmitting && activeDeliverableId === deliverable.id;

                return (
                  <div
                    key={deliverable.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            Version {deliverable.version_number}
                          </h3>
                          <Badge variant={getStatusVariant(status) as any}>
                            {status}
                          </Badge>
                          {deliverable.is_final && (
                            <Badge variant="success">Final</Badge>
                          )}
                        </div>

                        <p className="mt-2 break-words font-medium text-gray-800">
                          {deliverable.file_name}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                          <span>
                            {deliverable.file_type || "File"} ·{" "}
                            {formatFileSize(deliverable.file_size_bytes)}
                          </span>
                          <span>
                            Uploaded {formatDate(deliverable.created_at)}
                          </span>
                          <span>
                            By {deliverable.uploaded_by_name || "System"}
                          </span>
                        </div>

                        {deliverable.delivery_notes && (
                          <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            {deliverable.delivery_notes}
                          </p>
                        )}

                        {deliverable.delivered_at && (
                          <p className="mt-3 text-xs text-gray-500">
                            Released {formatDate(deliverable.delivered_at)}
                            {deliverable.released_by_name
                              ? ` by ${deliverable.released_by_name}`
                              : ""}
                          </p>
                        )}

                        {deliverable.client_confirmed_at && (
                          <p className="mt-1 text-xs text-green-700">
                            Client confirmed receipt on{" "}
                            {formatDate(deliverable.client_confirmed_at)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 lg:max-w-[440px] lg:justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(deliverable)}
                          disabled={downloadingId === deliverable.id}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          {downloadingId === deliverable.id
                            ? "Preparing..."
                            : "Download"}
                        </Button>

                        {!isCompleted && status === "Draft" && (
                          <>
                            {!deliverable.is_final && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  window.confirm(
                                    `Make Version ${deliverable.version_number} the final deliverable?`,
                                  ) && runAction(deliverable.id, "set_final")
                                }
                                disabled={isActive}
                              >
                                <Star className="mr-1 h-4 w-4" />
                                Set Final
                              </Button>
                            )}

                            <Button
                              size="sm"
                              onClick={() =>
                                window.confirm(
                                  `Release Version ${deliverable.version_number} to Scholar Haven™?`,
                                ) && runAction(deliverable.id, "release")
                              }
                              disabled={isActive}
                            >
                              <Upload className="mr-1 h-4 w-4" />
                              Release
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(deliverable)}
                              disabled={isActive}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        )}

                        {!isCompleted && status === "Released" && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                window.confirm(
                                  `Withdraw Version ${deliverable.version_number} from client access?`,
                                ) && runAction(deliverable.id, "withdraw")
                              }
                              disabled={isActive}
                            >
                              <Undo2 className="mr-1 h-4 w-4" />
                              Withdraw
                            </Button>

                            <Button
                              size="sm"
                              onClick={() =>
                                window.confirm(
                                  `Mark Version ${deliverable.version_number} as confirmed by the client?`,
                                ) && runAction(deliverable.id, "confirm")
                              }
                              disabled={isActive}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Mark Confirmed
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={closeUploadModal}
        title="Upload Deliverable"
      >
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Input
            label="Deliverable File"
            type="file"
            onChange={handleFileChange}
            disabled={isSubmitting}
          />

          {uploadForm.file && (
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">
                {uploadForm.file.name}
              </p>
              <p className="mt-1">{formatFileSize(uploadForm.file.size)}</p>
            </div>
          )}

          <Textarea
            label="Delivery Notes"
            value={uploadForm.description}
            onChange={(event) =>
              setUploadForm((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            rows={4}
            placeholder="Optional notes for this deliverable"
            disabled={isSubmitting}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4">
            <input
              type="checkbox"
              checked={uploadForm.isFinal}
              onChange={(event) =>
                setUploadForm((previous) => ({
                  ...previous,
                  isFinal: event.target.checked,
                }))
              }
              disabled={isSubmitting}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block font-medium text-gray-900">
                Mark as final version
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                This removes the final designation from any earlier deliverable.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={closeUploadModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isSubmitting || !uploadForm.file}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSubmitting ? "Uploading..." : "Upload Deliverable"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
