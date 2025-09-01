import { FilePreviewProps, FiltType } from './props';
import { ReactComponent as DocumentIcon } from '@shared/images/icons/document.svg';
import { ReactComponent as PdfIcon } from '@shared/images/icons/pdf.svg';
import { ReactComponent as AttachIcon } from '@shared/images/icons/attach.svg';
import { ReactComponent as ReloadIcon } from '@shared/images/icons/reload.svg';
import { cn } from '@app/utils/cn';
import styles from './styles.module.scss';
import ProgressIndicator from '@shared/uikit/progress-indicator';
import IconButton from '../icon-button';
import Tooltip from '../tooltip';
import { forwardRef } from 'react';

const getFileIcon = (fileType: FiltType) => {
  switch (fileType) {
    case 'doc':
      return DocumentIcon;
    case 'pdf':
      return PdfIcon;
    default:
      return AttachIcon;
  }
};

const FilePreview = forwardRef<HTMLDivElement, FilePreviewProps>(
  function FilePreview(
    {
      filtType,
      disabled,
      fileName,
      className,
      progress,
      error,
      showProgress,
      children,
      onRetry,
      ...props
    },
    ref,
  ) {
    const Icon = getFileIcon(filtType);
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          styles['file-preview'],
          { [styles['file-preview_disabled']]: disabled },
          'transition',
          className,
        )}
      >
        <Icon className={styles.icon} />
        <p
          title={fileName}
          className={styles['file-preview__text']}
        >
          {children}
        </p>
        {!!error && (
          <Tooltip content='Retry'>
            <IconButton
              aria-label={`Retry ${fileName} file upload`}
              size='xs'
              variant='active'
              onClick={onRetry}
              className={styles['file-preview__right-content']}
            >
              <ReloadIcon />
            </IconButton>
          </Tooltip>
        )}
        {showProgress && !error && (
          <ProgressIndicator
            className={styles['file-preview__right-content']}
            aria-label={`Loading progress of ${fileName}`}
            progress={progress}
          />
        )}
      </div>
    );
  },
);

export default FilePreview;
