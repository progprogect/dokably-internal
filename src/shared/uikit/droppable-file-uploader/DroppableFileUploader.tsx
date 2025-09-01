import { cn } from '@app/utils/cn';
import styles from './styles.module.scss';
import { DroppableFileUploaderProps } from './props';
import { useDropzone } from '@shared/lib/utils/browser/useDropzone';
import { forwardRef, useId, useImperativeHandle } from 'react';

const DroppableFileUploader = forwardRef<
  HTMLLabelElement,
  DroppableFileUploaderProps
>(function DroppableFileUploader(
  { children, onDrop, className, ...props },
  ref,
) {
  const {
    onDragLeave,
    onDragOver,
    onDrop: handleDrop,
    overDropzone,
    dropzoneRef,
  } = useDropzone<HTMLLabelElement>({
    onDrop,
  });

  useImperativeHandle<HTMLLabelElement | null, HTMLLabelElement | null>(
    ref,
    () => dropzoneRef.current,
  );

  return (
    <label
      ref={dropzoneRef}
      onDrop={handleDrop}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      className={cn(
        styles['input-wrapper'],
        { [styles.active]: overDropzone },
        'transition',
        className,
      )}
    >
      <input
        {...props}
        type='file'
        className={styles['input-file']}
      />
      {children}
    </label>
  );
});

export default DroppableFileUploader;
