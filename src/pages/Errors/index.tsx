import React, { ErrorInfo, ReactNode } from 'react';
import './style.css';
import Button from '@shared/common/Button';

interface Props {
  action?: () => void;
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
    // return { hasError: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary'>
          <div className='error-boundary__container'>
            <div className='error-boundary__title'>Something went wrong.</div>
            <div className='error-boundary__info__button'>
              <Button
                styleType='small-black'
                label='Reload'
                onClick={this.props.action}
              />
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
