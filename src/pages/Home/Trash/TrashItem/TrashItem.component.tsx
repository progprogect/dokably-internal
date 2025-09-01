import { MouseEvent } from 'react';
import { trashItemResources } from './TrashItem.resources';
import cssStyles from './style.module.scss';
import { ITrashItem } from './TrashItem.types';

import { ReactComponent as Document } from '@images/document.svg';
import { ReactComponent as Trash } from '@images/trash.svg';
import { ReactComponent as Undo } from '@images/undo.svg';
import { track } from '@amplitude/analytics-browser';
import { deleteForeverUnit, undoUnit } from './TrashItem.service';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectUnits,
  setDeletedUnits,
  setUnits,
} from '@app/redux/features/unitsSlice';
import { getDeletedUnits, getUnits } from '@app/services/unit.service';
import { Unit } from '@entities/models/unit';
import toast from 'react-hot-toast';
import { successToastOptions } from '@shared/common/Toast';
import { capitalizeFirstLetter } from '@app/utils/unitls';

const TrashItem = ({ item, workspaceId }: ITrashItem) => {
  const { restore, deleteForever } = trashItemResources['en'];
  const items = useSelector(selectUnits).units;

  const dispatch = useDispatch();

  const handleClickUndo = (event: MouseEvent): void => {
    event.preventDefault();

    undoUnit(workspaceId, item.id)
      .then((response: Response) => {
        if (response.ok) {
          track('trash_undo_confirmed', { id: item.id });

          getUnits(workspaceId).then((units: Unit[]) => {
            const tempDefaultChannel = items.find((x) => x.isDefault);
            if (tempDefaultChannel) {
              const temp = units.find((x) => x.id === tempDefaultChannel.id);
              if (temp) {
                temp.isDefault = true;
                units.sort((unit: Unit) => (unit.isDefault ? 1 : -1));
              }
            }
            units.sort((a, b) => {
              let c = a.createdAt ? new Date(a.createdAt) : new Date();
              let d = b.createdAt ? new Date(b.createdAt) : new Date();
              return d.getTime() - c.getTime();
            });
            dispatch(setUnits(units));

            toast.success(
              `${capitalizeFirstLetter(item.type)} '${
                item.name
              }' has been restored`,
              successToastOptions,
            );
          });
          getDeletedUnits(workspaceId).then((units: Unit[]) => {
            dispatch(setDeletedUnits(units));
          });
        } else {
          track('trash_undo_failed', {
            id: item.id,
            reason: response.statusText,
          });
        }
      })
      .catch((error: any) => {
        track('trash_undo_failed', {
          id: item.id,
          reason: JSON.stringify(error),
        });
      });
  };

  const handleClickDeleteForever = (event: MouseEvent): void => {
    event.preventDefault();

    deleteForeverUnit(workspaceId, item.id)
      .then((response: Response) => {
        if (response.ok) {
          track('trash_delete_confirmed', { id: item.id });
          toast.success(
            `${capitalizeFirstLetter(item.type)} '${
              item.name
            }' has been deleted`,
            successToastOptions,
          );
          getDeletedUnits(workspaceId).then((units: Unit[]) => {
            dispatch(setDeletedUnits(units));
          });
        } else {
          track('trash_delete_failed', {
            id: item.id,
            reason: response.statusText,
          });
        }
      })
      .catch((error: any) => {
        track('trash_delete_failed', {
          id: item.id,
          reason: JSON.stringify(error),
        });
      });
  };

  return (
    <div className={cssStyles.wrapper}>
      <div className={cssStyles.icon}>
        <Document />
      </div>
      <div className={cssStyles.title}>{item.name}</div>
      <div className={cssStyles.actions}>
        <div
          className={cssStyles.restore}
          onClick={handleClickUndo}
        >
          {restore}
          <Undo />
        </div>
        <div
          className={cssStyles.deleteForever}
          onClick={handleClickDeleteForever}
        >
          {deleteForever}
          <Trash />
        </div>
      </div>
    </div>
  );
};

export default TrashItem;
