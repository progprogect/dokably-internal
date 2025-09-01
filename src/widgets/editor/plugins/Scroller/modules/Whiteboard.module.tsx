import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';

import { useClickOutside } from '@app/hooks/useClickOutside';

import { createDocument } from '@app/services/document.service';

import { UnitType } from '@entities/models/unit';
import { EditorProps } from '@entities/props/Editor.props';

import { DocumentIcon, WhiteboardIcon } from '@shared/images/icons/IconsComponents';
import { createWhiteboard } from '@app/services/whiteboard.service';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';

const WhiteboardModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { units, addUnit } = useUnitsContext();
  const navigate = useNavigate();
  const newUnitClick = useClickOutside(false);

  const createUnit = async (type: UnitType) => {
    const channel = units.filter((unit) => unit.type === 'channel').find((unit) => unit.isDefault);
    if (channel) {
      const id = uuidv4();
      const newUnit = await getCreateQuery(type, channel.id, id);
      if (newUnit) {
        addUnit(newUnit);
        _.delay(() => {
          newUnitClick.setIsVisible(false);
          navigate(`/workspace/${newUnit.id}`);
        }, 100);
      }
    }
  };

  const getCreateQuery = (type: UnitType, channelId: string, id: string) => {
    switch (type) {
      case 'document':
        return createDocument(channelId, id);
      case 'whiteboard':
        return createWhiteboard(channelId, id);
      default:
        return createDocument(channelId, id);
    }
  };
  return (
    <div
      onClick={() => createUnit('whiteboard')}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <WhiteboardIcon />
      Whiteboard
    </div>
  );
};

export default WhiteboardModule;
