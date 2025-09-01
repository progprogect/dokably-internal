import { isValidElement, MouseEvent, ReactElement } from 'react';
import { FileActionsProps } from './props';
import styles from './styles.module.scss';

function ActionsToolbar<A extends string>({ children }: FileActionsProps<A>) {
  return (
    <ul
      className={styles['actions-toolbar']}
      role='toolbar'
    >
      {children.reduce<ReactElement[]>((acc, child, index) => {
        if (!isValidElement(child)) return acc;
        if (index !== 0) {
          acc.push(
            <li
              className={styles.separator}
              role='separator'
              aria-hidden
              key={`separator-${index}`}
            />,
          );
        }

        acc.push(<li key={child.key}>{child}</li>);
        return acc;
      }, [])}
    </ul>
  );
}

export default ActionsToolbar;
