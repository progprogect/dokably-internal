import { AtomicBlockUtils, EditorState } from 'draft-js';
import { ReactComponent as FileIcon } from '@shared/images/icons/file.svg';
import { FILE_ENTITY_TYPE } from '../../blocks/FileUploader/constants/file-entity-type';

type FileUploaderProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void;
};

const FileUploader = ({ callback }: FileUploaderProps) => {
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        FILE_ENTITY_TYPE,
        'IMMUTABLE',
        {},
      );

      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    };

    callback(command);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <FileIcon className='text-base text-text40' />
      File
    </button>
  );
};

export default FileUploader;
