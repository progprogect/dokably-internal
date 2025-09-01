import {
  DragEvent,
  DragEventHandler,
  useCallback,
  useRef,
  useState,
} from 'react';

type UseDropzoneProps<E extends HTMLElement> = {
  onDrop: DragEventHandler<E>;
};

export function useDropzone<E extends HTMLElement>({
  onDrop,
}: UseDropzoneProps<E>) {
  const dropzoneRef = useRef<E | null>(null);
  const isAlreadyOverDoppableZone = useRef<boolean>(false);
  const [overDropzone, setOverDropzone] = useState<boolean>(false);

  const reset = useCallback(() => {
    isAlreadyOverDoppableZone.current = false;
    setOverDropzone(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<E>) => {
      event.preventDefault();
      onDrop(event);
      reset();
    },
    [reset, onDrop],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (isAlreadyOverDoppableZone.current) return;
    setOverDropzone(true);
  }, []);

  const onDragLeave = useCallback(
    (event: DragEvent<E>) => {
      event.preventDefault();
      const droppableZone = dropzoneRef.current;
      const relatedTarget = event.relatedTarget;
      if (!droppableZone) {
        return;
      }

      if (
        !relatedTarget ||
        !(relatedTarget instanceof HTMLElement) ||
        !droppableZone.contains(relatedTarget)
      ) {
        reset();
      }
    },
    [reset],
  );

  return {
    dropzoneRef,
    overDropzone,
    onDrop: handleDrop,
    onDragOver,
    onDragLeave,
  };
}
