import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import { useMemo } from 'react';
import { UnitActionListProps } from '../props';
import DuplicateButton from '@widgets/components/Actions/DuplicateButton/DuplicateButton.component';
import CopyLinkButton from '@widgets/components/Actions/CopyLinkButton/CopyLinkButton.component';
import ShareButton from '@widgets/components/Actions/ShareButton/ShareButton.component';
import DeleteButton from '@widgets/components/Actions/DeleteButton/DeleteButton.component';
import DownloadPDFButton from '@widgets/components/Actions/DownloadPDFButton/DownloadPDFButton.component';

export const useDocumentActionList = ({ unit, callback }: UnitActionListProps) => {
  const { canDuplicateUnit, canShareInviteUnit, canDeleteUnit } =
    usePermissionsContext();

  const showDuplicateBtn = useMemo(
    () => unit ? canDuplicateUnit(unit.id) : false,
    [canDuplicateUnit, unit?.id],
  );

  const showShareBtn = useMemo(
    () => unit ? canShareInviteUnit(unit.id) : false,
    [canShareInviteUnit, unit?.id],
  );

  const showDeleteBtn = useMemo(
    () => unit ? canDeleteUnit(unit.id) : false,
    [canDeleteUnit, unit?.id],
  );

  const isEmptyList = !showDuplicateBtn && !showShareBtn && !showDeleteBtn;

  // Always show menu if PDF download is available, even if other actions are hidden
  if (isEmptyList && unit) return (
    <DownloadPDFButton
      unit={unit}
      callback={callback}
    />
  );
  
  if (!unit) return null;

  return (
    <>
      {showDuplicateBtn && (
        <DuplicateButton
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
      <DownloadPDFButton
        unit={unit}
        callback={callback}
      />
      {showDeleteBtn && (
        <DeleteButton
          unit={unit}
          callback={callback}
        />
      )}
    </>
  );
};
