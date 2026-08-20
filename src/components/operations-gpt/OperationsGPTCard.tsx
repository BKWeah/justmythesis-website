'use client';

import { ReactNode } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { OperationsGPTButton } from './OperationsGPTButton';
import { OperationsGPTLoader } from './OperationsGPTLoader';
import { OperationsGPTStatus } from './OperationsGPTStatus';

type OperationsGPTStatusType =
  | 'idle'
  | 'success'
  | 'warning'
  | 'error';

interface OperationsGPTCardProps {
  title: string;
  description: string;
  buttonLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  status?: OperationsGPTStatusType;
  statusMessage?: string;
  currentStep?: string;
  onAnalyze: () => void | Promise<void>;
  children?: ReactNode;
  footer?: ReactNode;
}

export function OperationsGPTCard({
  title,
  description,
  buttonLabel = 'Analyze with Operations GPT',
  loadingLabel = 'Analyzing...',
  isLoading = false,
  disabled = false,
  status = 'idle',
  statusMessage,
  currentStep,
  onAnalyze,
  children,
  footer,
}: OperationsGPTCardProps) {
  return (
    <Card className="border-brand-green/20 bg-gradient-to-br from-white to-brand-green/5">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
              <Bot className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{title}</CardTitle>
                <Sparkles className="h-4 w-4 text-brand-gold" />
              </div>

              <p className="mt-1 max-w-2xl text-sm text-gray-600">
                {description}
              </p>
            </div>
          </div>

          <OperationsGPTButton
            label={buttonLabel}
            loadingLabel={loadingLabel}
            isLoading={isLoading}
            disabled={disabled}
            onClick={onAnalyze}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        {isLoading ? (
          <OperationsGPTLoader currentStep={currentStep} />
        ) : statusMessage ? (
          <OperationsGPTStatus
            status={status}
            message={statusMessage}
          />
        ) : (
          <OperationsGPTStatus
            status="idle"
            message="Ready to analyze this request. The generated result will remain a draft until a staff member reviews and saves it."
          />
        )}

        {children ? <div>{children}</div> : null}

        {footer ? (
          <div className="border-t border-gray-200 pt-4">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}