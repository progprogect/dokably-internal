import styles from './style.module.scss';
import cn from 'classnames';
import { ReactComponent as Hide } from '@images/doubleArrow.svg';
import SidebarHeader from './sidebar-header';
import SidebarTopActions from './sidebar-top-actions';
import SidebarUnitsPanel from './sidebar-units-panel';
import SidebarBottomActions from './sidebar-bottom-actions';
import { useLocalStorage } from 'usehooks-ts';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import useEmbedded from '@app/hooks/whiteboard/useEmbedded';

const Sidebar = () => {
  const [isHide, hideSidebar] = useLocalStorage('sidebarHidden', false);
  const { units } = useUnitsContext();
  const { documentId } = useParams();
  const isEmbedded = useEmbedded();

  const isWhiteboard = useMemo(() => {
    if (documentId) {
      const unit = units.find((unit) => unit.id === documentId);
      if (unit && unit.type === 'whiteboard') {
        return true;
      }
    }

    return false;
  }, [documentId, units]);

  if (isEmbedded) {
    return null;
  }

  return !isHide ? (
    <div className={cn(styles.sidebar, { [styles.shadow]: isWhiteboard })}>
      <SidebarHeader />
      <SidebarTopActions />
      <SidebarUnitsPanel />
      <SidebarBottomActions />
    </div>
  ) : (
    <Tippy
      duration={0}
      content='Show sidebar'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <Hide
        className={styles.sidebarHiddenIcon}
        onClick={() => hideSidebar(false)}
      />
    </Tippy>
  );
};

export default Sidebar;
