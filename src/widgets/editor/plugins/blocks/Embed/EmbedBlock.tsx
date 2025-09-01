import './style.css';

import { EditorBlock, EditorState } from 'draft-js';
import { getHostNameType, getUrl } from '@app/services/embed.service';
import { useMemo, useState } from 'react';

import BlockType from '@entities/enums/BlockType';
import BookmarkBlock from './modules/BookmarkModule/Bookmark.module';
import EmbedType from '@entities/enums/EmbedType';
import FigmaEmbedBlock from './modules/FigmaModule/Figma.module';
import LoomEmbedBlock from './modules/LoomModule/LoomEmbedBlock';
import MiroEmbedBlock from './modules/MiroModule/MiroEmbedBlock';
import PDFEmbedBlock from './modules/PDFModule/PDFEmbedBlock';
import TrelloEmbedBlock from './modules/TrelloModule/TrelloEmbededBlock';
import { getPlaceholder, getTab } from '@app/services/block.service';
import useBlockData from '@app/hooks/editor/useBlockData';
import ContextMenu from '@widgets/editor/plugins/ContextMenu/ContextMenu';
import cn from 'classnames';
import EmbedDNDWrapper from './EmbedDndWrapper';
import Placeholder from '@widgets/components/Placeholder';
import { selectBlockBefore } from '@app/services/document.service';
import WhiteboardEmbedBlock from '@widgets/editor/plugins/blocks/Embed/modules/WhiteboardModule/WhiteboardEmbedBlock';
import GoogleDriveEmbedBlock from '@widgets/editor/plugins/blocks/Embed/modules/GoogleDriveModule/GoogleDriveEmbedBlock';
import useEditorState from '@app/hooks/editor/useEditorState';

const EmbedBlock = (props: any) => {
  const { block } = props;
  const { store } = props.blockProps;
  const isShow = useMemo(() => block.getData().get('isShow'), [block]);
  const isActive = useMemo(() => block.getData().get('state'), [block]);
  const blockType = block.getType();
  const { insertEmptyBlockAfter } = useEditorState();
  

  const handleInsertTextBlock = () => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      const newEditorState = insertEmptyBlockAfter(editorState, block.getKey(), {
        type: BlockType.Text,
        text: '',
        depth: block.getDepth(),
      });

      return newEditorState;
    });
  };

  return isShow !== false ? (
    <EmbedDNDWrapper
      block={block}
      setEditorState={store.getItem('setEditorState')}
      getEditorState={() => store.getItem('getEditorState')()}
    >
      <div
        className='dokably-embed-block__wrapper'
        style={{ paddingLeft: getTab(block.getDepth() + 1) }}
      >
        <ContextMenu
          block={block}
          store={store}
          options={{
            delete: true,
            extend: [BlockType.EmbedGoogleDrive].includes(blockType),
            open: [BlockType.EmbedGoogleDrive].includes(blockType),
          }}
        />
        {!isActive ? <EmbedInputLink {...props} /> : <RenderedEmbed {...props} />}
      </div>
    </EmbedDNDWrapper>
  ) : null;
};

const RenderedEmbed = (props: any) => {
  const { block } = props;

  const url = useMemo(() => {
    let _url = getUrl(block.getText());
    const blockType = block.getType();
    if (blockType === BlockType.EmbedWhiteboard) {
      _url = block.getData().get('url');
    }
    const urlType = getHostNameType(_url);
    if (blockType === BlockType.EmbedFigma && urlType !== EmbedType.Figma) {
      _url = 'invalid';
    }
    if (blockType === BlockType.EmbedMiro && urlType !== EmbedType.Miro) {
      _url = 'invalid';
    }
    if (blockType === BlockType.EmbedPDF && urlType !== EmbedType.PDF) {
      _url = 'invalid';
    }
    if (blockType === BlockType.EmbedLoom && urlType !== EmbedType.Loom) {
      _url = 'invalid';
    }
    if (blockType === BlockType.EmbedTrello && urlType !== EmbedType.Trello) {
      _url = 'invalid';
    }
    if (blockType === BlockType.EmbedGoogleDrive && ![EmbedType.GoogleDrive, EmbedType.GoogleDocs].includes(urlType)) {
      _url = 'invalid';
    }

    return _url;
  }, [block.getText()]);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const renderFrame = () => {
    const blockType = block.getType();

    if (blockType === BlockType.EmbedWhiteboard) {
      return (
        <WhiteboardEmbedBlock
          url={block.getData().get('url')}
          setIsLoaded={setIsLoaded}
          name={block.getData().get('name')}
        />
      );
    }

    const type = getHostNameType(url);

    if (blockType === BlockType.EmbedBookmark) {
      return <BookmarkBlock url={url} />;
    } else if (type === EmbedType.Figma) {
      return (
        <FigmaEmbedBlock
          url={url}
          setIsLoaded={setIsLoaded}
        />
      );
    } else if (type === EmbedType.Miro) {
      return (
        <MiroEmbedBlock
          url={url}
          setIsLoaded={setIsLoaded}
        />
      );
    } else if (type === EmbedType.Trello) {
      return (
        <TrelloEmbedBlock
          url={url}
          setIsLoaded={setIsLoaded}
        />
      );
    } else if (type === EmbedType.Loom) {
      return (
        <LoomEmbedBlock
          url={url}
          setIsLoaded={setIsLoaded}
        />
      );
    } else if (type === EmbedType.GoogleDrive || type === EmbedType.GoogleDocs) {
      return (
        <GoogleDriveEmbedBlock
          url={url}
          block={block}
          setIsLoaded={setIsLoaded}
        />
      );
    } else if (type === EmbedType.PDF) {
      return (
        <PDFEmbedBlock
          url={url}
          setIsLoaded={setIsLoaded}
        />
      );
    } else {
      return <BookmarkBlock url={url} />;
    }
  };

  return (
    <div
      className='w-full'
      contentEditable={false}
    >
      {!isLoaded && <BookmarkBlock url={url} />}
      <div className={`dokably-embed-block__active ${isLoaded ? 'flex' : 'hidden'}`}>{renderFrame()}</div>
    </div>
  );
};

const EmbedInputLink = (props: any) => {
  const { block } = props;
  const { store } = props.blockProps;
  const { setBlockDataValue } = useBlockData();
  const editorState = store.getItem('getEditorState')();
  const selection = editorState.getSelection();
  const isBlockFocused = selection.getHasFocus() && selection.getAnchorKey() === block.getKey();

  const placeholder = useMemo(() => {
    return getPlaceholder(block.getType());
  }, [block.getType()]);

  const onEmbedBlockClick = () => {
    store.getItem('setEditorState')((editorState: EditorState) => {
      const selection = editorState.getSelection();
      if (
        selection.getAnchorKey() !== block.getKey() ||
        (selection.getAnchorKey() === block.getKey() && selection.getHasFocus() === false)
      ) {
        const newSelection = selection.merge({
          anchorKey: block.getKey(),
          focusKey: block.getKey(),
          anchorOffset: block.getText().length,
          focusOffset: block.getText().length,
          hasFocus: true,
        });

        return EditorState.forceSelection(editorState, newSelection);
      }
      return editorState;
    });
  };

  const handleChange = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    store.getItem('setEditorState')((editorState: EditorState) => {
      if (block.getText().length > 0) {
        editorState = setBlockDataValue(editorState, block, 'isDisable', true);
        editorState = setBlockDataValue(editorState, block, 'state', true);
      }
      editorState = selectBlockBefore(editorState, block.getKey());
      return editorState;
    });
  };
  const MemoizedEditorBlock = useMemo(
    () => (
      <EditorBlock
        {...props}
        onClick={onEmbedBlockClick}
      />
    ),
    [props],
  );
  return (
    <div
      className={cn('flex dokably-embed-block__no-active', {['dokably-embed-block__focused']: isBlockFocused})}
      onClick={onEmbedBlockClick}
    >
      <div className='dokably-embed-block__editor-block'>
        <Placeholder
          content={placeholder}
          isShow={block.getText().length === 0}
          isSmall={true}
        />
        {MemoizedEditorBlock}
      </div>
      <div
        contentEditable={false}
        style={{
          color: block.getText().length > 0 ? '#3E3E41' : '#949395',
        }}
        className={cn('dokably-embed-block__action', {
          'cursor-pointer': block.getText().length > 0,
        })}
        onClick={handleChange}
      >
        Embed
      </div>
    </div>
  );
};

export default EmbedBlock;
