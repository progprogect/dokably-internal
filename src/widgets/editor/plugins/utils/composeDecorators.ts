import { PluginBlockPropsToRender, PluginBlockToRender } from '../types';

type Decorator<P extends PluginBlockPropsToRender> = (
  Component: PluginBlockToRender<P>,
) => PluginBlockToRender<P>;

export function composeDecorators<P extends PluginBlockPropsToRender>(
  ...decorators: Array<Decorator<P>>
) {
  return function wrapComponent(WrappedComponent: PluginBlockToRender<P>) {
    return decorators.reduce(
      (acc, decorator) => decorator(acc),
      WrappedComponent,
    );
  };
}
