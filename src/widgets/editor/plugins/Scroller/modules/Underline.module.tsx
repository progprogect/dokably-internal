import { OrderedSet } from 'immutable';
import { EditorState } from 'draft-js';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';
import { UnderlineIcon } from '@shared/images/icons/IconsComponents';

type UnderlineModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void
}

const UnderlineModule = ({ callback }: UnderlineModuleProps) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      return EditorState.setInlineStyleOverride(
        toggleBlockType(editorState, BlockType.Underline),
        OrderedSet.of('UNDERLINE')
      )
    }

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <UnderlineIcon color={'#7F7E80'} />
      Underline
    </button>
  );
};

export default UnderlineModule;
