import {
  PluginBlockPropsToRender,
  PluginBlockToRender,
  PluginProps,
} from '../../types';

import styles from './styles.module.scss';

export const withTextStyle = <P extends PluginBlockPropsToRender>(
  WrappedComponent: PluginBlockToRender<P>,
) => {
  return (props: PluginProps<P>) => {
    return (
      <WrappedComponent
        className={styles['text-block']}
        {...props}
      />
    );
  };
};
