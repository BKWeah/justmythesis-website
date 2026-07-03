'use client';

import React, { Component, ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Something went wrong"
          description="An error occurred while loading the dashboard. Please refresh the page."
        />
      );
    }
    return this.props.children;
  }
}

export { DashboardErrorBoundary };
