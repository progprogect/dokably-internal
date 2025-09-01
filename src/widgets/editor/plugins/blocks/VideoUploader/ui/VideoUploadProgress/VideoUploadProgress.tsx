import React from 'react';
import { ReactComponent as VideoIcon } from '@shared/images/icons/video-play.svg';
import ProgressIndicator from '@shared/uikit/progress-indicator';
import { cn } from '@app/utils/cn';
import styles from '@shared/uikit/file-preview/styles.module.scss';

interface VideoUploadProgressProps {
  fileName: string;
  progress: number; // 0-100
  onCancel?: () => void;
}

const VideoUploadProgress: React.FC<VideoUploadProgressProps> = ({
  fileName,
  progress,
  onCancel
}) => {
  return (
    <div className={cn(styles['file-preview'])}>
      <VideoIcon className={styles.icon} />
      <p
        title={fileName}
        className={styles['file-preview__text']}
        style={{ fontSize: '14px' }}
      >
        {fileName}
      </p>
      <ProgressIndicator
        className={styles['file-preview__right-content']}
        aria-label={`Loading progress of ${fileName}`}
        progress={progress}
      />
    </div>
  );
};

export default VideoUploadProgress;
