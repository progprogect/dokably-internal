import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CornerDownLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@shared/uikit/dialog';
import { Button } from '@shared/uikit/button/button';
import { getModalState, updateDeleteBoardModalState } from '@app/redux/features/modalsSlice';
import { removeAtomicBlock } from '@app/hooks/editor/removeAtomicBlock';
import { useUnitsContext } from '@app/context/unitsContext/unitsContext';
import { getBlockEntity } from '@app/hooks/editor/getBlockEntity';
import { TASK_BOARD_ENTITY } from '@widgets/editor/plugins/blocks/TaskBoard/constants/task-board-entity-type';

const DeleteBoardConfirmation = () => {
  const dispatch = useDispatch();
  const { isOpen, editorState, contentBlock, pluginFunctions } = useSelector(getModalState).deleteBoardModalState;
  const { units } = useUnitsContext();

  // Get board name from units using entity data
  const boardName = useMemo(() => {
    if (!editorState || !contentBlock) return 'TaskBoard';
    
    try {
      const contentState = editorState.getCurrentContent();
      const entityKey = contentBlock.getEntityAt(0);
      if (entityKey) {
        const entity = contentState.getEntity(entityKey);
        const entityData = entity.getData();
        const boardId = entityData?.boardId;
        
        if (boardId) {
          const board = units.find((unit) => unit.type === 'task_board' && unit.id === boardId);
          return board?.name || 'TaskBoard';
        }
      }
    } catch (error) {
      console.error('Error getting board name:', error);
    }
    
    return 'TaskBoard';
  }, [editorState, contentBlock, units]);

  const handleDelete = () => {
    // Execute the actual deletion
    if (editorState && contentBlock && pluginFunctions) {
      const newEditorState = removeAtomicBlock(editorState, editorState.getCurrentContent(), contentBlock);
      pluginFunctions.setEditorState(newEditorState);
    }
    handleClose();
  };

  const handleClose = () => {
    dispatch(
      updateDeleteBoardModalState({
        isOpen: false,
        editorState: null,
        contentBlock: null,
        pluginFunctions: null,
      }),
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => handleClose()}
    >
      <DialogContent
        className='w-[512px]'
        contentEditable={false}
      >
        <DialogHeader>
          <DialogTitle className='text-wrap break-all'>Delete {boardName}</DialogTitle>
        </DialogHeader>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div>
          <div>Do you want to continue?</div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='secondary'
            className='flex-1 bg-background hover:bg-accent border-none'
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            icon={<CornerDownLeft className='w-4 h-4 mr-2' />}
            variant='secondary'
            className='flex-1 bg-background hover:bg-accent text-destructive border border-input'
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBoardConfirmation;