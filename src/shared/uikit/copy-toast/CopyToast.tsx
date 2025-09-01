import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { ReactComponent as CheckIcon } from '../../images/icons/check-green.svg';
import './CopyToast.scss';

interface CopyToastProps {
  show: boolean;
  onHide: () => void;
  message?: string;
}

const CopyToast: React.FC<CopyToastProps> = ({
  show,
  onHide,
  message = 'Copied to clipboard'
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className={cn('copy-toast', { 'copy-toast--show': show })}>
      <CheckIcon className="copy-toast__icon" />
      <span className="copy-toast__message">{message}</span>
    </div>
  );
};

export default CopyToast; 