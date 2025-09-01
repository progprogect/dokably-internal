import React from 'react';
import BlockType from '@entities/enums/BlockType';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import { EditorProps } from '@entities/props/Editor.props';
import { EditorState } from 'draft-js';
import { BasicTableIcon } from '@shared/images/icons/IconsComponents';

interface Props extends EditorProps {
  callback: () => void;
}

const TableModule = ({ setEditorState, callback }: Props) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setEditorState((editorState: EditorState) =>
      toggleBlockType(editorState, BlockType.Table),
    );
    callback();
  };

  return (
    <div
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <BasicTableIcon color='#7F7E80' />
      Table
    </div>
  );
};

export default TableModule;
