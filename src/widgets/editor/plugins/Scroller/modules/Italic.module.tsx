import { EditorState } from 'draft-js';
import { OrderedSet } from 'immutable';
import { ItalicIcon } from '@shared/images/icons/IconsComponents';
import useBlockTypes from '@app/hooks/editor/useBlockTypes';
import BlockType from '@entities/enums/BlockType';

type ItalicModuleProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void
}

const ItalicModule = ({ callback }: ItalicModuleProps) => {
  const { toggleBlockType } = useBlockTypes();

  const handleSelectTool = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      return EditorState.setInlineStyleOverride(
        toggleBlockType(editorState, BlockType.Italic),
        OrderedSet.of('ITALIC')
      )
    }

    callback(command);
  };

  return (
    <button
      onMouseDown={handleSelectTool}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <ItalicIcon color={'#7F7E80'} />
      Italic
    </button>
  );
};

export default ItalicModule;
