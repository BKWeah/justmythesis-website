'use client';

import { CheckCircle2, AlertCircle, Clock3, Sparkles } from 'lucide-react';

type StatusType =
  | 'idle'
  | 'success'
  | 'warning'
  | 'error';

interface OperationsGPTStatusProps {
  status: StatusType;
  message: string;
}

export function OperationsGPTStatus({
  status,
  message,
}: OperationsGPTStatusProps) {
  const styles = {
    idle: {
      icon: Sparkles,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      iconColor: 'text-slate-600',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-700',
    },
    warning: {
      icon: Clock3,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-700',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-700',
    },
  };

  const current = styles[status];
  const Icon = current.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${current.bg} ${current.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${current.iconColor}`} />

        <div>
          <h4 className={`font-semibold ${current.text}`}>
            Operations GPT
          </h4>

          <p className={`mt-1 text-sm ${current.text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}