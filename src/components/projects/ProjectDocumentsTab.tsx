'use client';

import { useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileText,
  LoaderCircle,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { ProjectDocument } from '@/hooks/useProjectDetail';

const CATEGORY_OPTIONS = [
  { value: 'Thesis Guide', label: 'Thesis Guide' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Draft Chapter', label: 'Draft Chapter' },
  { value: 'Supervisor Comment', label: 'Supervisor Comment' },
  { value: 'Data', label: 'Data' },
  { value: 'Payment Proof', label: 'Payment Proof' },
  { value: 'Agreement', label: 'Agreement' },
  { value: 'Final Deliverable', label: 'Final Deliverable' },
  { value: 'Other', label: 'Other' },
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.zip';
const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface Props {
  projectId: string;
  documents: ProjectDocument[];
  isCompleted: boolean;
  onChanged: () => Promise<void> | void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (!bytes) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectDocumentsTab({ projectId, documents, isCompleted, onChanged }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = () => {
    setFile(null);
    setCategory('Other');
    setDescription('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Select a document to upload.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The selected file is larger than the 25 MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const fileData = await fileToBase64(file);

      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          fileData,
          category,
          description,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to upload document.');
      }

      await onChanged();
      resetForm();
      setIsOpen(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document: ProjectDocument) => {
    try {
      setDownloadingId(document.id);
      setError(null);
      const response = await fetch(
        `/api/projects/${projectId}/documents?documentId=${encodeURIComponent(document.id)}`,
        { credentials: 'include', cache: 'no-store' }
      );
      const result = await response.json();
      if (!response.ok || !result?.url) {
        throw new Error(result?.error || 'Unable to download this document.');
      }
      window.location.assign(result.url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Unable to download this document.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      setError(null);
      const response = await fetch(
        `/api/projects/${projectId}/documents?documentId=${encodeURIComponent(deleteTarget.id)}`,
        {
          method: 'DELETE',
          credentials: 'include',
          cache: 'no-store',
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Unable to delete this document.');
      }

      await onChanged();
      setDeleteTarget(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this document.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm text-gray-500">Project files stored securely for this project.</p>
        </div>
        {!isCompleted && (
          <Button size="sm" variant="secondary" onClick={() => setIsOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>

      {error && !isOpen && !deleteTarget && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                  <FileText className="h-5 w-5 text-brand-green" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{document.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {document.category} • {formatSize(document.file_size)}
                  </p>
                  {document.description && (
                    <p className="mt-1 text-sm text-gray-500">{document.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleDownload(document)}
                  disabled={downloadingId === document.id || isDeleting}
                >
                  {downloadingId === document.id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="ml-2">{downloadingId === document.id ? 'Preparing' : 'Download'}</span>
                </Button>
                {!isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      setDeleteTarget(document);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-2">Delete</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-gray-500">No documents uploaded</p>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (isUploading) return;
          setIsOpen(false);
          resetForm();
        }}
        title="Upload Project Document"
      >
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Document</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={(event) => {
                const selected = event.target.files?.[0] || null;
                setFile(selected);
                setError(null);
              }}
              disabled={isUploading}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-brand-green/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-green"
            />
            <p className="mt-1 text-xs text-gray-500">PDF, Office documents, text, images or ZIP. Maximum 25 MB.</p>
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            options={CATEGORY_OPTIONS}
            disabled={isUploading}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional document description"
            rows={3}
            disabled={isUploading}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleUpload()} disabled={isUploading || !file}>
            {isUploading ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
          setError(null);
        }}
        title="Delete Document"
      >
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteTarget?.file_name}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setDeleteTarget(null);
              setError(null);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? <LoaderCircle className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {isDeleting ? 'Deleting...' : 'Delete Document'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
