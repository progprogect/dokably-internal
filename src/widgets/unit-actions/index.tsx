import ShareButton from '../components/Actions/ShareButton/ShareButton.component';
import { Unit } from '@entities/models/unit';
import cssStyles from './style.module.scss';
import { UnitActionListBtn } from '@widgets/unit-action-lists/UnitActionListBtn';

const UnitActions = ({ unit }: { unit: Unit }) => {
  return (
    <div className={cssStyles.unitAction}>
      <ShareButton
        unit={unit}
        withIcon={false}
      />
      <UnitActionListBtn popupAlign='end' size="l" unit={unit} />
    </div>
  );
};

export default UnitActions;
