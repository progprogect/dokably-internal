import { useEffect } from 'react';
import { track } from '@amplitude/analytics-browser';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import cn from 'classnames';

import { useWorkspaceContext } from '@app/context/workspace/context';
import { Unit } from '@entities/models/unit';
import { setDeletedUnits } from '@app/redux/features/unitsSlice';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

import { trashPageResources } from './TrashPage.resources';
import TrashItem from './TrashItem/TrashItem.component';
import { getRemovedItems } from './TrashPage.service';
import cssStyles from './style.module.scss';

const TrashPage = () => {
  const [isHide] = useLocalStorage('sidebarHidden', false);
  const { activeWorkspace } = useWorkspaceContext();
  const { breadcrumbs, title } = trashPageResources['en'];
  const { deletedUnits } = useUnitsContext();
  const dispatch = useDispatch();

  useEffect(() => {
    track('trash_page_opened');

    if (activeWorkspace) {
      getRemovedItems(activeWorkspace.id).then((units) => {
        if (units != deletedUnits) {
          dispatch(setDeletedUnits(units));
        }
      });
    }
  }, []);

  return (
    <div className='workspace-details'>
      <header className='head-panel'>
        <div
          className={cn('bread-crumbs', {
            'bread-crumbs__withShowSidebarButton': isHide,
          })}
        >
          {breadcrumbs}
        </div>
      </header>
      <main className={cn('workspace', cssStyles.workspace)}>
        <div className={cn('title', cssStyles.title)}>{title}</div>
        <div className={cssStyles.trashItemsList}>
          {deletedUnits.map((item: Unit) => (
            <TrashItem
              key={uuidv4()}
              item={item}
              workspaceId={activeWorkspace?.id || ''}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default TrashPage;
