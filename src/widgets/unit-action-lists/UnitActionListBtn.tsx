import { Unit, UnitType } from '@entities/models/unit';
import { useUnitActionList } from './useUnitActionList';
import MoreButton from '@shared/uikit/more-button';
import { track } from '@amplitude/analytics-browser';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { useAnonymousGuestActionsList } from './anonymous-guest-actions-list/useAnonymousGuestActionsList';
import useUser from '@app/hooks/useUser';

type UnitActionListBtnProps<U extends { id: string; type: UnitType }> = {
  unit: U;
  onOpen?: (open: boolean) => void;
} & Pick<ComponentProps<typeof MoreButton>, 'popupAlign' | 'size' | 'variant'>;

export const UnitActionListBtn = <U extends { id: string; type: UnitType }>({
  unit,
  popupAlign,
  size,
  variant,
  onOpen,
}: UnitActionListBtnProps<U>) => {
  const { units } = useUnitsContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const user = useUser();
  const isAnonymousGuestUser = useMemo(
    () => user?.email === 'anonymous',
    [user],
  );
  
  const _unit = units.find((u) => u.id === unit.id);
  
  // Always call hooks, even if _unit is null (to maintain hook order)
  const unitActionListJSX = useUnitActionList({
    unit: _unit || null, // convert undefined to null
    callback: closeMenu,
  });
  const anonymousGuestActionsListJSX = useAnonymousGuestActionsList({
    callback: closeMenu,
  });

  // Early returns after all hooks are called
  if (!_unit) return null;

  const actionListToShow = isAnonymousGuestUser
    ? anonymousGuestActionsListJSX
    : unitActionListJSX;

  if (!actionListToShow) return null;

  return (
    <MoreButton
      popupPosition='bottom'
      popupAlign={popupAlign}
      variant={variant}
      size={size}
      isOpen={isMenuOpen}
      setIsOpen={setIsMenuOpen}
      children={actionListToShow}
      onOpenCallback={(_open) => {
        onOpen?.(_open);
        track(`${unit.type}_advanced_menu_opened`);
      }}
    />
  );
};
