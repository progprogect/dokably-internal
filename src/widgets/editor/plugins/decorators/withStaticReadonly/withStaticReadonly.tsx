import { ReactElement } from 'react';
import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginProps,
} from '../../types';
import { useDokablyEditor } from '@features/editor/DokablyEditor.context';

export const withStaticReadonly = <P extends PluginBlockPropsToRender>(
  WrappedComponent: PluginBlockToRender<P>,
) => {
  return (props: PluginProps<P> & { readonly?: boolean }): ReactElement => {
    const { staticReadonly } = useDokablyEditor();
    return (
      <WrappedComponent
        readonly={staticReadonly}
        {...props}
      />
    );
  };
};
