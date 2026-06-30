import { type HTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { statusColors, type StatusType } from '@/lib/theme';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: StatusType;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = ({
  className,
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  ...props
}: AlertProps) => {
  const config = statusColors[variant];
  
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Info,
  };
  
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        'relative flex gap-3 rounded-lg border p-4',
        config.bg,
        config.border,
        className
      )}
      role="alert"
      {...props}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.icon)} />
      <div className="flex-1">
        {title && (
          <h3 className={cn('font-medium mb-1', config.text)}>
            {title}
          </h3>
        )}
        <div className={cn('text-sm', title ? config.text : config.text)}>
          {children}
        </div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'absolute right-2 top-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity',
            config.text
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Convenience components
const AlertSuccess = ({ className, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="success" className={className} {...props} />
);

const AlertWarning = ({ className, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="warning" className={className} {...props} />
);

const AlertError = ({ className, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="error" className={className} {...props} />
);

const AlertInfo = ({ className, ...props }: Omit<AlertProps, 'variant'>) => (
  <Alert variant="info" className={className} {...props} />
);

export { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo };