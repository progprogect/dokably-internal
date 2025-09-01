import { MouseEvent } from 'react';

import { cn } from '@app/utils/cn';
import { UnitType } from '@entities/models/unit';
import ActiveElement from '@shared/uikit/active-element';
import ExpandCollapseButton from '@shared/uikit/expand-collapse-button';

import UnitLabel from '../unit-label';
import UnitActionsPanel from '../unit-actions-panel';
import { getUnitTypeIcon } from '../../utils/get-unit-type-icon';

import { UnitElementProps } from './props';
import styles from './styles.module.scss';

function UnitElement<
  U extends { id: string; name: string; type: UnitType; color: string | null },
>({
  isActive,
  showExpandCollapseButton,
  isExpanded,
  unit,
  className: propsClassName,
  onExpand,
  onCreateUnit,
}: UnitElementProps<U>) {
  const handleExpandCollapseButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    const isExpanded = Boolean(Number(event.currentTarget.dataset.expanded));
    const elementId = event.currentTarget.dataset.id;
    if (!elementId) return;
    onExpand?.(!isExpanded, elementId);
  };

  return (
    <ActiveElement
      variant={isActive ? 'active' : 'transparent'}
      size='l'
      className={propsClassName}
    >
      {({ className }) => (
        <div
          className={cn(
            'flex items-center w-full',
            styles['unit-element'],
            className,
          )}
        >
          {showExpandCollapseButton && (
            <ExpandCollapseButton
              data-expanded={Number(isExpanded)}
              isExpanded={isExpanded}
              data-id={unit.id}
              onClick={handleExpandCollapseButtonClick}
              className='absolute left-[4px]'
            />
          )}
          <UnitLabel
            leftSide={getUnitTypeIcon(unit)}
            label={unit.name}
            id={unit.id.toString()}
          />
          <UnitActionsPanel
            onCreateUnit={onCreateUnit}
            unit={unit}
            className={styles.actions}
          />
        </div>
      )}
    </ActiveElement>
  );
}

export default UnitElement;
