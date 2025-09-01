import { EditorState, Modifier } from 'draft-js';
import { useCallback, useEffect, useState } from 'react';

import BlockType from '@entities/enums/BlockType';
import BulletListModule from './modules/BulletList.module';
import CheckListModule from './modules/CheckList.module';
import EmbedFigmaModule from './modules/EmbedFigma.module';
import EmbedLoomModule from './modules/EmbedLoom';
import EmbedGoogleDriveModule from './modules/EmbedGoogleDrive';
import EmbedMiroModule from './modules/EmbedMiro.module';
import EmbedTrelloModule from './modules/EmbedTrello';
import Heading1Module from './modules/Heading1.module';
import Heading2Module from './modules/Heading2.module';
import Heading3Module from './modules/Heading3.module';
import { IGNORED_BLOCKS_FOR_EDITING } from '@app/constants/embeds';
import IsVisible from '@entities/models/IsVisible';
import NumberedListModule from './modules/NumberedList.module';
import { ScrollerProps } from '@entities/props/Scroller.props';
import TextModule from './modules/Text.module';
import ToggleListModule from './modules/ToggleList.module';
import useContentBlock from '@app/hooks/editor/useContentBlock';
import EmbedBookmarkModule from './modules/EmbedBookmark.module';

import './style.css';
import ComingSoon from '@widgets/components/ComingSoon';
import { track } from '@amplitude/analytics-browser';
import { getActiveClassName } from '@app/utils/selection';
import KanbanModule from './modules/Kanban.module';
import ListViewModule from './modules/ListView.module';
import TableModule from './modules/Table.module';
import TableOfContent from '@widgets/editor/plugins/Scroller/modules/TableOfContext.module';
import BoldModule from './modules/Bold.module';
import UnderlineModule from './modules/Underline.module';
import ItalicModule from './modules/Italic.module';
import StrikethroughModule from './modules/Strikethrough.module';
import DocumentModule from './modules/Document.module';
import SubDocumentModule from './modules/Subdocument.module';
import MentionPersonModule from '@widgets/editor/plugins/Scroller/modules/MentionPerson.module';
import MentionDateModule from '@widgets/editor/plugins/Scroller/modules/MentionDate.module';
import MentionDocumentModule from '@widgets/editor/plugins/Scroller/modules/MentionDocument.module';
import MentionWhiteboardModule from '@widgets/editor/plugins/Scroller/modules/MentionWhiteboard.module';
import DividerModule from './modules/Divider.module';
import EmojiModule from '@widgets/editor/plugins/Scroller/modules/Emoji.module';
import EmbedWhiteboard from '@widgets/editor/plugins/Scroller/modules/EmbedWhiteboard.module';
import FileUploader from './modules/FileUploader.module';
import VideoUploader from './modules/VideoUploader.module';
import TableViewModule from './modules/TableView.module';
import { LoaderIcon } from 'react-hot-toast';
import usePopper from '@app/hooks/usePopper';
import BannerModule from '@widgets/editor/plugins/Scroller/modules/Banner';
import usePopperStyles from './hooks/usePopperStyles';
import { usePermissionsContext } from '@app/context/permissionsContext/permissionsContext';
import {
  UNIT_PERMISSION_ADD_DOC,
  UNIT_PERMISSION_ADD_SUB_DOC,
  UNIT_PERMISSION_EMBEDED_WHITEBOARD,
  UNIT_PERMISSION_MENTION_DOC,
  UNIT_PERMISSION_MENTION_WHITEBOARD,
} from '@entities/models/unitPermissions';

const PORTAL_ID = 'scroller-portal';

const ScrollerPlugin = (props: ScrollerProps) => {
  const { getUnitPermissions } = usePermissionsContext();
  const permissions = getUnitPermissions(props.unitId);
  const [isVisible, setIsVisible] = useState<IsVisible | null>(null);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const { setEditorState, ImageScrollerButton, editorContainerRef, mode = 'default' } = props;
  const [secondMenu, setSecondMenu] = useState<string | null>('date');
  const { getCurrentContentBlock } = useContentBlock();
  const [pluginIsAdding, setPluginIsAdding] = useState<boolean>(false);
  const [isOpenedInTable, setIsOpenedInTable] = useState(false);

  const callback = (command?: (editorState: EditorState) => EditorState) => {
    setIsVisible(null);
    setSecondMenu(null);
    setEditorState((editorState) => {
      const contentBlock = getCurrentContentBlock(editorState);
      const selectionState = editorState.getSelection();

      const selectionStateProperties = {
        focusKey: contentBlock.getKey(),
        anchorKey: contentBlock.getKey(),
        ...(contentBlock.getText() === '/'
          ? {
              focusOffset: contentBlock.getText().length,
              anchorOffset: 0,
            }
          : {
              focusOffset: selectionState.getFocusOffset(),
              anchorOffset: selectionState.getFocusOffset() - 1,
            }),
      };

      const newSelection = selectionState.merge(selectionStateProperties);
      const contentState = Modifier.replaceText(editorState.getCurrentContent(), newSelection, '');
      const newState = EditorState.push(editorState, contentState, 'spellcheck-change');
      return command ? command(newState) : newState;
    });
    setPluginIsAdding(false);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      setIsVisible(null);
      if (event.key === '/' || event.key === '@') {
        const contentBlock = getCurrentContentBlock(props.editorState);
        if (contentBlock.getType() === BlockType.Table) {
          setIsOpenedInTable(true);
        } else {
          setIsOpenedInTable(false);
          if (event.key === '@') {
            setSecondMenu(BlockType.MentionPerson);
          } else {
            setSecondMenu(null);
          }
        }

        track('document_slash_menu_opened');
        setTimeout(() => {
          const range = window.getSelection()?.getRangeAt(0);
          const contentBlock = getCurrentContentBlock(props.editorState);
          if (!IGNORED_BLOCKS_FOR_EDITING.includes(contentBlock.getType() as BlockType)) {
            if (range) {
              let referenceElement = (range.commonAncestorContainer as HTMLElement).getBoundingClientRect
                ? (range.commonAncestorContainer as HTMLElement)
                : range;
              let positionRect = referenceElement.getBoundingClientRect();

              if (positionRect) {
                setReferenceElement(referenceElement as HTMLElement);
                setIsVisible({
                  rect: positionRect,
                  activeClassName: getActiveClassName(),
                });
              }
            }
          }
        }, 1);
      } else {
        setReferenceElement(null);
      }
    },
    [props.editorState],
  );

  useEffect(() => {
    const editor = editorContainerRef.current;
    editor?.addEventListener('keydown', handleKeyDown);

    return () => {
      editor?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    container.scrollTop += event.deltaY;
  };

  const handleBackdropClick = useCallback(() => {
    setIsVisible(null);
    setSecondMenu(null);
    setReferenceElement(null);
  }, []);

  const popperStyles = usePopperStyles(isVisible);

  const menuContent = (
    <>
      {secondMenu ? (
        <>
          <MentionPersonModule.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
          <MentionDateModule.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
          <MentionDocumentModule.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
          <MentionWhiteboardModule.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
          <EmojiModule.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
          <EmbedWhiteboard.Menu
            {...props}
            menu={secondMenu}
            callback={callback}
          />
        </>
      ) : (
        <div
          className='scroller'
          onWheel={handleWheel}
        >
          <div className='font-medium text-text40 text-xs2 scroller__section_header'>Text and Layout</div>
          <div className='flex text-sm3l text-text80 mt-2.5'>
            <div className='min-w-160 flex flex-col gap-1'>
              <TextModule
                {...props}
                callback={callback}
              />
              <Heading1Module
                {...props}
                callback={callback}
              />
              <Heading2Module
                {...props}
                callback={callback}
              />
              <Heading3Module
                {...props}
                callback={callback}
              />
              <BoldModule callback={callback} />
              <UnderlineModule callback={callback} />
              <ItalicModule callback={callback} />
            </div>
            <div className='min-w-160 ml-2 flex flex-col gap-1'>
              <StrikethroughModule
                {...props}
                callback={callback}
              />
              <BulletListModule
                {...props}
                callback={callback}
              />
              <NumberedListModule
                {...props}
                callback={callback}
              />
              <ToggleListModule
                {...props}
                callback={callback}
              />
              <CheckListModule
                {...props}
                callback={callback}
              />
              {!isOpenedInTable && (
                <DividerModule
                  {...props}
                  callback={callback}
                />
              )}
              <BannerModule
                {...props}
                callback={callback}
              />
            </div>
          </div>
          <div className='font-medium text-text40 text-xs2 scroller__section_header'>Add</div>
          <div className='flex text-sm3l text-text80 mt-2.5'>
            <div className='min-w-160 flex flex-col gap-1'>
              {!isOpenedInTable && (
                <TableModule
                  {...props}
                  callback={callback}
                />
              )}
              <EmbedBookmarkModule
                {...props}
                callback={callback}
              />
              {!isOpenedInTable && (
                <TableOfContent
                  {...props}
                  callback={callback}
                />
              )}
            </div>
            <div className='min-w-160 ml-2 flex flex-col gap-1'>
              {mode === 'default' && permissions.includes(UNIT_PERMISSION_ADD_DOC) && (
                <DocumentModule
                  {...props}
                  callback={callback}
                />
              )}
              {!isOpenedInTable && mode === 'default' && permissions.includes(UNIT_PERMISSION_ADD_SUB_DOC) && (
                <SubDocumentModule
                  {...props}
                  callback={callback}
                />
              )}
              <EmojiModule
                {...props}
                toggleSecondMenu={setSecondMenu}
              />
            </div>
          </div>
          <div className='font-medium text-text40 text-xs2 scroller__section_header'>UPLOAD</div>
          <div className='flex text-sm3l text-text80'>
            <div className='min-w-160 flex flex-col gap-1'>
              <ImageScrollerButton
                {...props}
                callback={callback}
              />
              <VideoUploader callback={callback} />
            </div>
            <div className='min-w-160 ml-2 flex flex-col gap-1'>
              <FileUploader callback={callback} />
            </div>
          </div>
          {!isOpenedInTable && mode === 'default' && (
            <>
              <div className='font-medium text-text40 text-xs2 scroller__section_header'>NEW TASKS</div>
              <div className='flex text-sm3l text-text80 mt-2.5'>
                <div className='min-w-160 flex flex-col gap-1'>
                  <KanbanModule
                    {...props}
                    callback={callback}
                    setPluginIsAdding={setPluginIsAdding}
                  />
                </div>
                <div className='min-w-160 flex flex-col gap-1'>
                  <ListViewModule
                    {...props}
                    callback={callback}
                    setPluginIsAdding={setPluginIsAdding}
                  />
                </div>
              </div>
              <div className='flex text-sm3l text-text80 mt-2.5'>
                <div className='min-w-160 flex flex-col gap-1'>
                  <TableViewModule
                    {...props}
                    callback={callback}
                    setPluginIsAdding={setPluginIsAdding}
                  />
                </div>
              </div>
            </>
          )}
          <div className='font-medium text-text40 text-xs2 mt-8.55 scroller__section_header'>MENTION</div>
          <div className='flex text-sm3l text-text80 mt-2.5'>
            <div className='min-w-160 flex flex-col gap-1'>
              <MentionPersonModule toggleSecondMenu={setSecondMenu} />
              <MentionDateModule toggleSecondMenu={setSecondMenu} />
            </div>
            <div className='min-w-160 flex flex-col gap-1'>
              {permissions.includes(UNIT_PERMISSION_MENTION_DOC) && (
                <MentionDocumentModule toggleSecondMenu={setSecondMenu} />
              )}
              {permissions.includes(UNIT_PERMISSION_MENTION_WHITEBOARD) && (
                <MentionWhiteboardModule toggleSecondMenu={setSecondMenu} />
              )}
            </div>
          </div>
          <div className='font-medium text-text40 text-xs2 scroller__section_header'>EMBEDS</div>
          <div className='flex text-sm3l text-text80 mt-2.5'>
            <div className='min-w-160 flex flex-col gap-1'>
              {permissions.includes(UNIT_PERMISSION_EMBEDED_WHITEBOARD) && (
                <EmbedWhiteboard toggleSecondMenu={setSecondMenu} />
              )}
              <EmbedMiroModule
                {...props}
                callback={callback}
              />
              <EmbedGoogleDriveModule
                {...props}
                callback={callback}
              />
            </div>
            <div className='min-w-160 flex flex-col gap-1'>
              <EmbedFigmaModule
                {...props}
                callback={callback}
              />
              <EmbedLoomModule
                {...props}
                callback={callback}
              />
              <EmbedTrelloModule
                {...props}
                callback={callback}
              />
            </div>
          </div>

          {/* <div className='relative mt-[36px] h-[22px]'>
            <ComingSoon />
          </div>
          <div className='flex text-sm3l text-text80 opacity-70 cursor-default pointer-events-none select-none'>
            <div className='min-w-160 flex flex-col gap-1'>
              <EmbedPDFModule
                {...props}
                callback={callback}
              />
            </div>
          </div> */}
        </div>
      )}
      {pluginIsAdding && (
        <div className='plugin-adding-loader'>
          <LoaderIcon style={{ width: 24, height: 24 }} />
        </div>
      )}
    </>
  );

  const popover = usePopper({
    portalId: PORTAL_ID,
    referenceElement: referenceElement,
    externalStyles: popperStyles,
    placement: 'bottom-start',
    children: menuContent,
    className: 'scroller-popper',
  });

  if (isOpenedInTable) {
    return null;
  }

  return (
    <div id={PORTAL_ID}>
      {isVisible && (
        <div
          className='fixed inset-0 z-[100] pointer-events-auto'
          onClick={handleBackdropClick}
        />
      )}
      {popover}
    </div>
  );
};

export default ScrollerPlugin;
