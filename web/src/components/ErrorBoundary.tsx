// web/src/components/ErrorBoundary.tsx

import React from 'react';
import { logError } from '../lib/log';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    logError(error, 'ReactErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
          <h1>Something went wrong</h1>
          <p>Refresh the page. If it keeps happening, tell CLEAR what you were doing.</p>
          <p style={{ color: '#b00020' }}>{this.state.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
