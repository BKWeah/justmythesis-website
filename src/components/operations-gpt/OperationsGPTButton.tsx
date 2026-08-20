'use client';

import { Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface OperationsGPTButtonProps {
  label?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void | Promise<void>;
  className?: string;
}

export function OperationsGPTButton({
  label = 'Analyze with Operations GPT',
  loadingLabel = 'Analyzing...',
  isLoading = false,
  disabled = false,
  onClick,
  className,
}: OperationsGPTButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bot className="mr-2 h-4 w-4" />
      )}

      {isLoading ? loadingLabel : label}
    </Button>
  );
}