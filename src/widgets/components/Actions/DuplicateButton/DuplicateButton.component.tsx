import { IDuplicateButton } from './DuplicateButton.types';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import { ReactComponent as Duplicate } from '@images/duplicate.svg';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import ActiveButton from '@shared/uikit/active-button';

const DuplicateButton = ({ unit, callback }: IDuplicateButton) => {
  const navigate = useNavigate();
  const { duplicateUnit } = useUnitsContext();

  const handleDuplicate = async () => {
    const newUnit = await duplicateUnit(unit);

    _.delay(() => {
      navigate(`/workspace/${newUnit.id}`);
    }, 100);

    callback && callback();
  };

  return (
    <ActiveButton leftSection={<Duplicate />} onClick={handleDuplicate}>
      Duplicate
    </ActiveButton>
  )
};

export default DuplicateButton;
