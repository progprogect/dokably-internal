import { ComponentPropsWithoutRef, DragEventHandler } from 'react';

export type DroppableFileUploaderProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type'
> & {
  onDrop: DragEventHandler<HTMLLabelElement>;
};
