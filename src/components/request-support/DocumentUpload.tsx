'use client';

import { useState, useCallback } from 'react';
import { useForm, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DOCUMENT_CATEGORIES } from '@/lib/supabase/types';

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

export function DocumentUpload({ clientId, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      addFiles(selectedFiles);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    []
  );

  const addFiles = (newFiles: File[]) => {
    const filesWithPreview: FileWithPreview[] = newFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'Other',
      description: '',
    }));
    setFiles((prev) => [...prev, ...filesWithPreview]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileCategory = (id: string, category: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, category } : f))
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDragging
            ? 'border-brand-green bg-brand-green/5'
            : 'border-gray-200 hover:border-gray-300'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="p-4 rounded-full bg-brand-green/10">
            <Upload className="h-8 w-8 text-brand-green" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, Word, Excel, or images up to 50MB
            </p>
          </div>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Documents ({files.length})
          </h4>
          {files.map((fileData) => (
            <div
              key={fileData.id}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 mt-1">
                <File className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileData.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileData.file.size)}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Select
                    options={categoryOptions}
                    value={fileData.category}
                    onChange={(e) => updateFileCategory(fileData.id, e.target.value)}
                    placeholder="Select category"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(fileData.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Documents are optional but recommended</p>
            <p className="mt-1 text-blue-600">
              You can submit your request without documents. If you have a thesis
              guide, proposal draft, or supervisor comments, uploading them will help
              us better understand your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FileWithPreview };