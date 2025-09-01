import React, { useState } from 'react';
import cn from 'classnames';
import { track } from '@amplitude/analytics-browser';
import { EditorProps, EditorState } from 'draft-js';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';
import { DashDividerIcon, DividerIcon } from '@shared/images/icons/IconsComponents';
import './style.scss';

const DividerModule = ({ setEditorState, callback }: EditorProps & any) => {
  const { toggleBlockType } = useBlockTypes();
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>, type: BlockType) => {
    event.preventDefault();
    setShowMenu(false);
    // track('document_edit_style_selected', {
    //   path: 'slash',
    //   option: 'heading3',
    // });
    setEditorState((editorState: EditorState) => toggleBlockType(editorState, type));
    callback();
  };

  return (
    <>
      <div
        onClick={() => setShowMenu(!showMenu)}
        className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
      >
        <DividerIcon color={'#7F7E80'} />
        Divider
      </div>
      {showMenu && (
        <div className='divider_submenu__container'>
          <div
            className='divider_submenu__item'
            onMouseDown={(event) => handleSelectTool(event, BlockType.SolidDivider)}
          >
            <DividerIcon color={'#7F7E80'} />
            Solid divider
          </div>
          <div
            className='divider_submenu__item'
            onMouseDown={(event) => handleSelectTool(event, BlockType.DashDivider)}
          >
            <DashDividerIcon color={'#7F7E80'} />
            Dash divider
          </div>
        </div>
      )}
    </>
  );
};

export default DividerModule;
