'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, File, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Select } from '@/components/ui/Select';
import { DOCUMENT_CATEGORIES } from '@/lib/supabase/types';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface FileWithPreview {
  file: File;
  id: string;
  category: string;
  description: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  url?: string;
}

interface DocumentUploadProps {
  clientId: string;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  onUploadComplete?: (files: FileWithPreview[]) => void;
}

const categoryOptions = DOCUMENT_CATEGORIES.map((cat) => ({
  value: cat.value,
  label: cat.label,
}));

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const notifyChange = useCallback(
    (nextFiles: FileWithPreview[]) => {
      setFiles(nextFiles);
      onUploadComplete?.(nextFiles);
    },
    [onUploadComplete],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const filesWithPreview: FileWithPreview[] = newFiles.map((file) => ({
        file,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        category: 'Other',
        description: '',
      }));

      setFiles((current) => {
        const next = [...current, ...filesWithPreview];
        onUploadComplete?.(next);
        return next;
      });
    },
    [onUploadComplete],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(event.target.files || []));
      event.target.value = '';
    },
    [addFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(event.dataTransfer.files));
    },
    [addFiles],
  );

  const removeFile = (id: string) => {
    notifyChange(files.filter((file) => file.id !== id));
  };

  const updateFileCategory = (id: string, category: string) => {
    notifyChange(
      files.map((file) => (file.id === id ? { ...file, category } : file)),
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-10',
          isDragging
            ? 'border-brand-green bg-brand-green/5 shadow-sm'
            : 'border-[var(--border-default)] bg-[var(--surface-subtle)] hover:border-brand-green/50 hover:bg-brand-green/[0.025]',
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="sr-only"
          id="file-upload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />

        <label
          htmlFor="file-upload"
          className="flex cursor-pointer flex-col items-center gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[var(--border-subtle)]">
            <Upload className="h-6 w-6 text-brand-green" aria-hidden="true" />
          </div>

          <div>
            <p className="font-semibold text-[var(--text-primary)]">
              Drop files here or choose from your device
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              PDF, Word, Excel, JPG or PNG, up to 50 MB per file.
            </p>
          </div>

          <span className="inline-flex min-h-10 items-center justify-center rounded-xl border border-brand-green/20 bg-white px-4 py-2 text-sm font-semibold text-brand-green shadow-sm">
            Choose files
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              Selected documents
            </h4>
            <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {files.map((fileData) => (
            <div
              key={fileData.id}
              className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-white p-4 shadow-sm sm:flex-row sm:items-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-subtle)]">
                <File className="h-5 w-5 text-brand-green" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {fileData.file.name}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {formatFileSize(fileData.file.size)}
                </p>

                <div className="mt-3 max-w-sm">
                  <Select
                    label="Document category"
                    options={categoryOptions}
                    value={fileData.category}
                    onChange={(event) =>
                      updateFileCategory(fileData.id, event.target.value)
                    }
                    placeholder="Select category"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFile(fileData.id)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl text-[var(--text-muted)] transition hover:bg-red-50 hover:text-red-600 sm:self-start"
                aria-label={`Remove ${fileData.file.name}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-blue-800">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="text-sm leading-6">
          <p className="font-semibold">Documents are optional</p>
          <p className="mt-1 text-blue-700">
            A thesis guide, proposal draft, supervisor comments or related files can help the team assess your request more accurately.
          </p>
        </div>
      </div>
    </div>
  );
}

export type { FileWithPreview };
