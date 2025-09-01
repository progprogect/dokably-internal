import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/uikit/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ReactComponent as DeleteIcon } from '@icons/trash-grey.svg';
import { ContentBlock, ContentState, EditorState } from 'draft-js';

interface Props {
  block: ContentBlock;
  store: any;
}

const DeleteButton = ({ block, store }: Props) => {
  const handleDelete = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    store.getItem('setEditorState')((editorState: EditorState) => {
      const contentState = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const key = editorState.getSelection().getAnchorKey();
      const blockBeforeKey = editorState
        .getCurrentContent()
        .getKeyBefore(block.getKey());
      const blockBefore = editorState
        .getCurrentContent()
        .getBlockForKey(blockBeforeKey);
      const content = contentState
        .getBlockMap()
        .delete(block.getKey())
        .toOrderedMap();

      editorState = EditorState.push(
        editorState,
        ContentState.createFromBlockArray(content.toArray()),
        'remove-range',
      );
      if (block.getKey() === key) {
        editorState = EditorState.forceSelection(
          editorState,
          editorState.getSelection().merge({
            focusKey: blockBeforeKey,
            anchorKey: blockBeforeKey,
            focusOffset: blockBefore.getText().length,
            anchorOffset: blockBefore.getText().length,
          }),
        );
      } else {
        editorState = EditorState.forceSelection(editorState, selection);
      }

      return editorState;
    });
  };

  return (
    <div className='absolute -top-6 right-0'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-6 w-6 p-1 rounded-sm cursor-pointer hover:bg-text10' />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='border-border'
          contentEditable={false}
        >
          <DropdownMenuItem
            className='hover:bg-text10/60 px-2 py-1.5 rounded-md cursor-pointer text-text70 flex items-center gap-2'
            onClick={handleDelete}
          >
            <DeleteIcon /> Delete table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DeleteButton;
