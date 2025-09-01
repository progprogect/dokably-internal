import { ComponentPropsWithRef } from 'react';

export type WithDndHandlerProps = ComponentPropsWithRef<'div'> & {
  handlerVisibility?: 'default' | 'visible' | 'hidden';
  handlerProps: ComponentPropsWithRef<'button'>;
};
