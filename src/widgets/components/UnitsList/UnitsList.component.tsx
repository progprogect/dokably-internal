import { useSelector } from 'react-redux';
import { selectUnits } from '@app/redux/features/unitsSlice';
import { useEffect, useState } from 'react';
import { Unit } from '@entities/models/unit';
import { IUnitsList } from './UnitsList.types';
import { ReactComponent as Document } from '@images/document.svg';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import useUser from '@app/hooks/useUser';
import { useWorkspaceContext } from '@app/context/workspace/context';

import { Link } from 'react-router-dom';
import cssStyles from './style.module.scss';

const UnitsList = ({ unitId }: IUnitsList) => {
  const savedUnits = useSelector(selectUnits).units;
  const { workspaceId } = useParams();
  const user = useUser();
  const { activeWorkspace } = useWorkspaceContext();

  const [childUnits, setChildUnits] = useState<Unit[]>([]);

  // Определяем, является ли пользователь гостем
  const isGuest = activeWorkspace?.userRole === 'guest' || user?.email === 'anonymous';

  useEffect(() => {
    setChildUnits(() => {
      return savedUnits.filter(
        (unit: Unit) => unit.parentUnit && unit.parentUnit.id === unitId && unit.type !== 'task_board'
      );
    });
  }, [unitId, savedUnits]);

  // Генерируем правильную ссылку в зависимости от типа пользователя
  const getUnitLink = (unit: Unit) => {
    if (isGuest && workspaceId) {
      // Для гостей используем гостевы ссылки
      return `/workspaces/${workspaceId}/units/${unit.id}/guest`;
    } else {
      // Для обычных пользователей используем обычные ссылки
      return `/workspace/${unit.id}`;
    }
  };

  return (
    <div className={cssStyles.unitsList}>
      {childUnits.map((unit: Unit) => {
        return (
          <Link
            className={cssStyles.unitsListItem}
            key={uuidv4()}
            to={getUnitLink(unit)}
          >
            <div className={cssStyles.unitsListItemIcon}>
              <Document />
            </div>
            <div className={cssStyles.unitsListItemTitle}>{unit.name}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default UnitsList;
