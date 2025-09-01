import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { useClickOutside } from '@app/hooks/useClickOutside';
import { createDocument } from '@app/services/document.service';
import { UnitType } from '@entities/models/unit';
import { EditorProps } from '@entities/props/Editor.props';

import {
  DocumentIcon,
  SubDocumentIcon,
} from '@shared/images/icons/IconsComponents';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

const SubDocumentModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { units, addUnit } = useUnitsContext();
  const navigate = useNavigate();

  const openUnit = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  const { documentId } = useParams();

  const handleCreateSubDocument = async (event: any) => {
    event.stopPropagation();

    const unit = units.find((unit) => unit.id === documentId);
    const newDocumentId = uuidv4();
    if (unit !== undefined) {
      const newUnit = await createDocument(unit.id, newDocumentId);
      if (newUnit) {
        addUnit(newUnit);
        openUnit(newUnit.id);
      }
    }
  };

  return (
    <div
      onClick={handleCreateSubDocument}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <SubDocumentIcon color={'#7F7E80'} />
      New sub-doc
    </div>
  );
};

export default SubDocumentModule;
