import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import BoldModule from './modules/Bold.module';
import CheckListModule from './modules/CheckList.module';
import CodeModule from './modules/Code.module';
import CommentModule from './modules/comment-module';
import HighlightModule from './modules/Highlight.module';
import ItalicModule from './modules/Italic.module';
import ListMenuModule from './modules/ListMenu.module';
import MoreMenuModule from './modules/MoreMenu.module';
import StrikethroughModule from './modules/Strikethrough.module';
import TextColorModule from './modules/TextColor.module';
import TextHeadingModule from './modules/TextHeadingModule';
import UnderlineModule from './modules/Underline.module';
import * as _ from 'lodash';
import { track } from '@amplitude/analytics-browser';
import ReactDOM from 'react-dom';
import usePopper from '@app/hooks/usePopper';
import { EditorState } from 'draft-js';
import { IGNORED_BLOCKS_FOR_EDITING } from '@app/constants/embeds';

const ELEMENT_NODE = 1;

export interface SelectionData {
  startContainer: Node;
  endContainer: Node;
  startOffset: number;
  endOffset: number;
}

export interface ToolbarProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  toolbar?: {
    options: string[];
    inline: {
      options: string[];
    };
    blockType: {
      options: string[];
    };
  };
  showFontFamily?: boolean;
  LinkButton?: any;
  mode?: 'default' | 'task';
  onLinkClick?: (node: HTMLAnchorElement | null) => void;
}

const PORTAL_ID = 'toolbar-portal';

const ToolbarPlugin = (props: ToolbarProps) => {
  const { editorState, setEditorState, LinkButton, mode = 'default', onLinkClick } = props;

  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [referenceElement, setReferenceElement] = useState<any>(null);
  const [isLinkPanelOpen, setIsLinkPanelOpen] = useState(false);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const lastSelectionRef = useRef<Selection | null>(null);
  const lastRangeRef = useRef<Range | null>(null);

  const isVisible = useMemo(() => {
    const selectionState = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    
    if (selectionState.isCollapsed() && !isLinkPanelOpen && !isCommentPanelOpen) {
      return false;
    }
    
    const disabledBlocks = currentContent
      .getBlocksAsArray()
      .filter((block) => IGNORED_BLOCKS_FOR_EDITING.includes(block.getType()))
      .map((block) => block.getKey());
    
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    
    const isInDisabledBlock = disabledBlocks.includes(startKey) || 
      disabledBlocks.includes(endKey) ||
      disabledBlocks.some(blockKey => {
        const blocksBetween = currentContent.getBlockMap()
          .skipUntil((_, k) => k === startKey)
          .takeUntil((_, k) => k === endKey);
        return blocksBetween.has(blockKey);
      });
    
    return !isInDisabledBlock || isLinkPanelOpen || isCommentPanelOpen;
  }, [editorState, isLinkPanelOpen, isCommentPanelOpen]);

  useEffect(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      lastSelectionRef.current = selection;
      lastRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, [editorState]);

  const updateToolbarPosition = useCallback(() => {
    let selection = window.getSelection();
    let range: Range | null = null;
    
    if ((isLinkPanelOpen || isCommentPanelOpen) && lastRangeRef.current) {
      range = lastRangeRef.current;
    } else if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      range = selection.getRangeAt(0);
    }
    
    if (!range) {
      return;
    }
    
    try {
      const rect = range.getBoundingClientRect();
      
      // Skip if range has no dimensions (can cause toolbar positioning issues)
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      
      const commonAncestorContainer =
        range.commonAncestorContainer.nodeType === ELEMENT_NODE
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement;
          
      const selectedNode = (commonAncestorContainer as HTMLElement)?.id
        ? commonAncestorContainer
        : commonAncestorContainer?.parentElement;
        
      setActiveElement(selectedNode as HTMLElement);
      
      const virtualElement = {
        getBoundingClientRect: () => rect,
        contextElement:
          range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentElement || document.body,
      };
      
      setReferenceElement(virtualElement);
    } catch (e) {
      console.error('Error getting range rect:', e);
      // Gracefully reset instead of leaving in broken state
      setReferenceElement(null);
      setActiveElement(null);
    }
  }, [isLinkPanelOpen, isCommentPanelOpen]);

  const ExtendedLinkButton = useCallback(
    (props: any) => {
      return LinkButton({
        ...props,
        onPanelOpen: () => setIsLinkPanelOpen(true),
        onPanelClose: () => setIsLinkPanelOpen(false),
      });
    },
    [LinkButton],
  );

  useEffect(() => {
    if (isVisible) {
      updateToolbarPosition();
      track('document_floating_menu_opened');
    } else if (!isLinkPanelOpen && !isCommentPanelOpen) {
      // Delay resetting position to prevent flash in top-left corner
      const timeoutId = setTimeout(() => {
        setReferenceElement(null);
        setActiveElement(null);
      }, 100); // Small delay to allow toolbar to fully hide
      
      // Don't return cleanup here - let setTimeout complete
    }
  }, [isVisible, isLinkPanelOpen, isCommentPanelOpen, updateToolbarPosition]);

  useEffect(() => {
    if (!isVisible) return;
    
    const handleSelectionChange = () => {
      updateToolbarPosition();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isVisible, updateToolbarPosition]);

  const toolbarContent = useMemo(
    () => (
      <div
        className='flex h-fit w-fit rounded shadow-menu bg-white py-1 select-none pointer-events-auto'
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {activeElement && (
          <div className='px-2 border-r-0.5 border-text20'>
            <TextHeadingModule
              editorState={editorState}
              setEditorState={setEditorState}
            />
          </div>
        )}
        <div className='flex px-2 border-r-0.5 border-text20'>
          <BoldModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <UnderlineModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <ItalicModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <StrikethroughModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
        </div>
        {activeElement && (
          <div className='flex px-2'>
            <CheckListModule
              editorState={editorState}
              setEditorState={setEditorState}
            />
            <ListMenuModule
              editorState={editorState}
              setEditorState={setEditorState}
            />
          </div>
        )}
        <div className='flex px-2 border-l-0.5 border-text20'>
          <CodeModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <ExtendedLinkButton
            editorState={editorState}
            setEditorState={setEditorState}
            onLinkClick={onLinkClick}
          />
          <TextColorModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          <HighlightModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
          {mode === 'default' && (
            <CommentModule
              props={{
                editorState,
                setEditorState,
              }}
              callback={() => {}}
              onPanelOpen={() => setIsCommentPanelOpen(true)}
              onPanelClose={() => setIsCommentPanelOpen(false)}
            />
          )}
        </div>
        <div className='px-2 border-l-0.5 border-text20 relative'>
          <MoreMenuModule
            editorState={editorState}
            setEditorState={setEditorState}
          />
        </div>
      </div>
    ),
    [activeElement, editorState, setEditorState, ExtendedLinkButton, mode, onLinkClick],
  );

  const popper = usePopper({
    portalId: PORTAL_ID,
    referenceElement: referenceElement,
    placement: 'top',
    children: toolbarContent,
    className: 'z-[101]',
    externalStyles: {},
  });

  useEffect(() => {
    let portalRoot = document.getElementById(PORTAL_ID);
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = PORTAL_ID;
      document.body.appendChild(portalRoot);
    }
  }, []);

  if (!isVisible || !referenceElement) {
    return null;
  }

  return ReactDOM.createPortal(
    <>
      <div
        className='fixed inset-0 z-[100] pointer-events-none'
        onClick={(e) => {
          e.preventDefault();
        }}
      />
      {popper}
    </>,
    document.getElementById(PORTAL_ID)!,
  );
};

export default ToolbarPlugin;
