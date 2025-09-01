import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { useMemo } from 'react';
import { UnitActionListProps } from '../props';
import ChannelSettingsButton from '@widgets/components/Actions/ChannelSettingsButton/ChannelSettingsButton.component';
import CopyLinkButton from '@widgets/components/Actions/CopyLinkButton/CopyLinkButton.component';
import ShareButton from '@widgets/components/Actions/ShareButton/ShareButton.component';
import DeleteButton from '@widgets/components/Actions/DeleteButton/DeleteButton.component';

export const useChannelActionList = ({
  unit,
  callback,
}: UnitActionListProps) => {
  const { canEditUnit, canShareInviteUnit, canDeleteUnit } = usePermissionsContext();

  const showSettingsBtn = useMemo(
    () => unit ? canEditUnit(unit.id) : false,
    [canEditUnit, unit?.id],
  );

  const showShareBtn = useMemo(
    () => unit ? canShareInviteUnit(unit.id) : false,
    [canShareInviteUnit, unit?.id],
  );

  const showDeleteBtn = useMemo(
    () => unit ? canDeleteUnit(unit.id) : false,
    [canDeleteUnit, unit?.id],
  );

  const isEmptyList = !showSettingsBtn && !showShareBtn && !showDeleteBtn;

  if (isEmptyList || !unit) return null;

  return (
    <>
      {showSettingsBtn && (
        <ChannelSettingsButton
          unit={unit}
          callback={callback}
        />
      )}
      {showShareBtn && (
        <CopyLinkButton
          unit={unit}
          callback={callback}
        />
      )}
      {showShareBtn && (
        <ShareButton
          unit={unit}
          withIcon={true}
          callback={callback}
        />
      )}
      {showDeleteBtn && (
        <DeleteButton
          unit={unit}
          callback={callback}
        />
      )}
    </>
  );
};
