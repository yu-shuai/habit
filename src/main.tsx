import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './fonts.css';
import './index.css';

interface EBProps {children: ReactNode}
interface EBState {hasError: boolean; error: string}

class ErrorBoundary extends Component<EBProps, EBState> {
  props: EBProps;
  state: EBState = {hasError: false, error: ''};

  static getDerivedStateFromError(error: Error): EBState {
    return {hasError: true, error: error.message + '\n' + error.stack};
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: 'red', fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
          <h2>App Error</h2>
          <p>{this.state.error}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

window.onerror = (msg, url, line, col, error) => {
  console.error('Global error:', msg, url, line, col, error);
  const el = document.getElementById('root');
  if (el && !el.hasChildNodes()) {
    el.innerHTML = `<div style="padding:20px;color:red;font-size:12px;white-space:pre-wrap;font-family:monospace">
      <h2>Runtime Error</h2>
      <p>${msg} at ${url}:${line}:${col}</p>
      ${error?.stack ? `<p>${error.stack}</p>` : ''}
    </div>`;
  }
};

window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  const el = document.getElementById('root');
  if (el && !el.hasChildNodes()) {
    el.innerHTML = `<div style="padding:20px;color:red;font-size:12px;white-space:pre-wrap;font-family:monospace">
      <h2>Async Error</h2>
      <p>${event.reason?.message || event.reason}</p>
      ${event.reason?.stack ? `<p>${event.reason.stack}</p>` : ''}
    </div>`;
  }
};

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:20px;color:red">Root element not found!</div>';
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
