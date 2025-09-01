import { getBreadCrumbs } from '@app/services/unit.service';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUnits } from '@app/redux/features/unitsSlice';
import { Unit } from '@entities/models/unit';

const useBreadcrumbs = (unit: Unit) => {
  const units = useSelector(selectUnits).units;
  return useMemo(() => getBreadCrumbs(unit, unit.name, units), [unit.name, units]);
};

export default useBreadcrumbs;
