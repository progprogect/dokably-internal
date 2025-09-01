import cn from 'classnames';
import ShareButton from '@widgets/components/Actions/ShareButton/ShareButton.component';
import UnitsList from '@widgets/components/UnitsList/UnitsList.component';
import { Unit } from '@entities/models/unit';
import { useLocalStorage } from 'usehooks-ts';
import { UnitActionListBtn } from '@widgets/unit-action-lists/UnitActionListBtn';
import useBreadcrumbs from '@app/hooks/useBreadcrumbs';

const ChannelDetails = ({ unit }: { unit: Unit }) => {
  const [isHide] = useLocalStorage('sidebarHidden', false);
  const breadcrumbs = useBreadcrumbs(unit);

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
        {!unit.isDefault && (
          <div className='actions'>
            <ShareButton
              unit={unit}
              withIcon={false}
            />
            <UnitActionListBtn
              popupAlign='end'
              size='l'
              unit={unit}
            />
          </div>
        )}
      </header>
      <main className='workspace'>
        <div className='title'>{unit.name}</div>
        <UnitsList unitId={unit.id} />
      </main>
    </div>
  );
};

export default ChannelDetails;
