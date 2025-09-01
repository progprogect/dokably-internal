import { EditorState } from 'draft-js';
import { OrderedSet } from 'immutable';
import { BoldIcon } from '@shared/images/icons/IconsComponents';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';

type BoldModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void
}

const BoldModule = ({ callback }: BoldModuleProps) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      return EditorState.setInlineStyleOverride(
        toggleBlockType(editorState, BlockType.Bold),
        OrderedSet.of('BOLD')
      )
    }

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <BoldIcon color={'#7F7E80'} />
      Bold
    </button>
  );
};

export default BoldModule;
