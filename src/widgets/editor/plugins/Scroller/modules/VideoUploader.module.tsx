import { EditorState, AtomicBlockUtils } from 'draft-js';
import { ReactComponent as VideoIcon } from '@shared/images/icons/video-play.svg';
import { VIDEO_ENTITY_TYPE } from '@widgets/editor/plugins/blocks/VideoUploader/constants/video-entity-type';

type VideoUploaderProps = {
  callback: (command: (editorState: EditorState) => EditorState) => void;
};

const VideoUploader = ({ callback }: VideoUploaderProps) => {
  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const command = (editorState: EditorState): EditorState => {
      const contentState = editorState.getCurrentContent();
      
      // Generate unique identifier for the block that will be created
      const blockId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const contentStateWithEntity = contentState.createEntity(
        VIDEO_ENTITY_TYPE,
        'IMMUTABLE',
        { blockId },
      );

      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
      
      // Get the newly created block and update entity with its key
      const newContentState = newEditorState.getCurrentContent();
      const blocks = newContentState.getBlocksAsArray();
      const newBlock = blocks[blocks.length - 1];
      const blockKey = newBlock.getKey();
      
      // Update entity with blockKey for reliable identification
      const finalContentState = newContentState.mergeEntityData(entityKey, { blockKey });
      
      return EditorState.push(newEditorState, finalContentState, 'apply-entity');
    };

    callback(command);
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
    >
      <VideoIcon className='text-base text-text40' />
      Video
    </button>
  );
};

export default VideoUploader;
