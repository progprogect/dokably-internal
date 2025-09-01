import { useSelector } from 'react-redux';
import { selectUnits } from '@app/redux/features/unitsSlice';
import { useEffect, useState } from 'react';
import { Unit } from '@entities/models/unit';
import { IUnitsList } from './UnitsList.types';
import { ReactComponent as Document } from '@images/document.svg';
import { v4 as uuidv4 } from 'uuid';

import { Link } from 'react-router-dom';
import cssStyles from './style.module.scss';

const UnitsList = ({ unitId }: IUnitsList) => {
  const savedUnits = useSelector(selectUnits).units;

  const [childUnits, setChildUnits] = useState<Unit[]>([]);

  useEffect(() => {
    setChildUnits(() => {
      return savedUnits.filter(
        (unit: Unit) => unit.parentUnit && unit.parentUnit.id === unitId && unit.type !== 'task_board'
      );
    });
  }, [unitId, savedUnits]);

  return (
    <div className={cssStyles.unitsList}>
      {childUnits.map((unit: Unit) => {
        return (
          <Link
            className={cssStyles.unitsListItem}
            key={uuidv4()}
            to={`/workspace/${unit.id}`}
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
