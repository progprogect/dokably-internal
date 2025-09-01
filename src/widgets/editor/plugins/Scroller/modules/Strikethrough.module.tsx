import { OrderedSet } from 'immutable';
import { EditorState } from 'draft-js';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';
import { StrikethroughIcon } from '@shared/images/icons/IconsComponents';

type StrikethroughModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void
}

const StrikethroughModule = ({ callback, }: StrikethroughModuleProps) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      return EditorState.setInlineStyleOverride(
        toggleBlockType(editorState, BlockType.Strikethrough),
        OrderedSet.of('STRIKETHROUGH')
      )
    }

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <StrikethroughIcon color={'#7F7E80'} />
      Strikethrough
    </button>
  );
};

export default StrikethroughModule;
