'use client';

import { Bot, Loader2, CheckCircle2 } from 'lucide-react';

interface OperationsGPTLoaderProps {
  currentStep?: string;
}

const defaultSteps = [
  'Reading client information...',
  'Reviewing request details...',
  'Checking uploaded documents...',
  'Evaluating complexity...',
  'Assessing risks...',
  'Preparing assessment...',
];

export function OperationsGPTLoader({
  currentStep,
}: OperationsGPTLoaderProps) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Bot className="h-5 w-5 text-blue-700" />
        </div>

        <div>
          <h3 className="font-semibold text-blue-900">
            Operations GPT
          </h3>

          <p className="text-sm text-blue-700">
            Analyzing your request...
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {defaultSteps.map((step) => (
          <div
            key={step}
            className="flex items-center gap-3"
          >
            {currentStep === step ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}

            <span
              className={`text-sm ${
                currentStep === step
                  ? 'font-medium text-blue-900'
                  : 'text-gray-600'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}