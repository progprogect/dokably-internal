import { ComponentType, ReactElement } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';
import { addImage } from './strategy';
import Immutable from 'immutable';
import {
  AtomicBlockUtils,
  DefaultDraftBlockRenderMap,
  Modifier,
} from 'draft-js';
import { Image as ImageComponent, ImageProps } from './Image';

import { ReactComponent as ImageIcon } from '@images/imageModuleIcon.svg';
import { EditorState } from 'draft-js';
import { EditorProps } from '@entities/props/Editor.props';

import './style.css';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import { selectBlock } from '@app/services/document.service';
import { track } from '@amplitude/analytics-browser';
import { createEditorPluginStore } from '../utils/createEditorPluginStore';

export interface ImagePluginTheme {
  image?: string;
}

const defaultTheme: ImagePluginTheme = {};

export interface ImagePluginConfig {
  decorator?(component: ComponentType<ImageProps>): ComponentType<ImageProps>;
  theme?: ImagePluginTheme;
  imageComponent?: ComponentType<ImageProps>;
}

export type ImageEditorPlugin = EditorPlugin & {
  addImage: typeof addImage;
  ImageScrollerButton: Function;
  extendedBlockRenderMap: Immutable.Map<any, any>;
};

export interface IImagePluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
}

export function createImagePlugin(
  config: ImagePluginConfig = {},
): ImageEditorPlugin {
  const theme = config.theme ? config.theme : defaultTheme;

  const store = createEditorPluginStore<IImagePluginStore>({
    getEditorState: undefined,
    setEditorState: undefined,
  });

  let Image = config.imageComponent || ImageComponent;
  if (config.decorator) {
    Image = config.decorator(Image);
  }
  const ThemedImage = (props: ImageProps): ReactElement => (
    <Image
      {...props}
      theme={theme}
    />
  );

  const blockRenderMap = Immutable.Map({
    atomic: {},
  });
  const extendedBlockRenderMap =
    DefaultDraftBlockRenderMap.merge(blockRenderMap);

  function insertImage({ editorState, setEditorState }: EditorProps) {
    const urlType = 'IMAGE';
    const contentState = editorState.getCurrentContent();
    const currentKey = editorState
      .getCurrentContent()
      .getBlockBefore(editorState.getSelection().getAnchorKey())
      ?.getKey();
    const contentStateWithEntity = contentState.createEntity(
      urlType,
      'MUTABLE',
      {},
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    editorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' ',
    );
    if (currentKey) {
      editorState = selectBlock(editorState, currentKey);
    }
    setEditorState(editorState);
  }

  function ImageScrollerButton({
    editorState,
    setEditorState,
    callback,
  }: EditorProps & { callback: Function }) {
    const { getCurrentContentBlock } = useContentBlock();

    // We have to do the same as callback in Scroller because we don't have the same object as callback have.
    // All this function is used to remove "/" symbol
    // editorState here is outdated and we cannot get the same state here because they are on different nesting levels and updated state stored in closure at the moment on Image button pressed
    const updatedEditorState = () => {
      const contentBlock = getCurrentContentBlock(editorState);
      if (contentBlock.getText() === '/') {
        let selectionState = editorState.getSelection();
        let newSelection = selectionState.merge({
          focusKey: contentBlock.getKey(),
          anchorKey: contentBlock.getKey(),
          focusOffset: contentBlock.getText().length,
          anchorOffset: 0,
        });
        const contentState = Modifier.replaceText(
          editorState.getCurrentContent(),
          newSelection,
          '',
        );
        return EditorState.push(editorState, contentState, 'spellcheck-change');
      } else {
        let selectionState = editorState.getSelection();
        let newSelection = selectionState.merge({
          focusKey: contentBlock.getKey(),
          anchorKey: contentBlock.getKey(),
          focusOffset: selectionState.getFocusOffset(),
          anchorOffset: selectionState.getFocusOffset() - 1,
        });
        const contentState = Modifier.replaceText(
          editorState.getCurrentContent(),
          newSelection,
          '',
        );
        return EditorState.push(editorState, contentState, 'spellcheck-change');
      }
    };

    const handleClick = () => {
      track('document_edit_insert_selected', { option: 'image' });
      Promise.resolve()
        .then(() => callback())
        .then(() =>
          insertImage({ editorState: updatedEditorState(), setEditorState }),
        );
    };

    return (
      <div
        onClick={handleClick}
        className='flex items-center py-1 gap-2 hover:bg-background cursor-pointer rounded'
      >
        <ImageIcon className='[&>path]:stroke-text40' />
        Image
      </div>
    );
  }

  return {
    blockRendererFn: (block, { getEditorState, setEditorState }) => {
      if (block.getType() === 'atomic') {
        const contentState = getEditorState().getCurrentContent();
        const entity = block.getEntityAt(0);
        if (!entity) return null;
        const type = contentState.getEntity(entity).getType();
        if (type === 'IMAGE' || type === 'image') {
          return {
            component: ThemedImage,
            editable: false,
            props: { getEditorState, setEditorState, store },
          };
        }
        return null;
      }

      return null;
    },
    initialize: ({ getEditorState, setEditorState }) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    addImage,
    ImageScrollerButton,
    extendedBlockRenderMap,
  };
}

export const Image = ImageComponent;
