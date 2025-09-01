import { CompositeDecorator, ContentBlock, ContentState, DraftDecorator, EditorState, RichUtils } from 'draft-js';
import { ForwardedRef, useLayoutEffect, useState, useEffect } from 'react';
import { toolbarStyleMap } from '@app/constants/Editor.styles';

import { EditorPlugin } from '@draft-js-plugins/editor';

import { EditorProps } from '@entities/props/Editor.props';
import { ReactComponent as LinkIcon } from '@images/link.svg';
import { EditLinkPanel, LinkPanel } from '@widgets/components/ToolbarLinkPanel';
import cn from 'classnames';
import React from 'react';
import Tippy from '@tippyjs/react';
import { getEntityRange } from '@app/utils/entity';
import { clearFocus } from '@features/editor/DokablyEditor.component';
import { track } from '@amplitude/analytics-browser';

export interface ILinkPluginStore {
  setEditorState?(editorState: EditorState): void;
  getEditorState?(): EditorState;
}

const findLinkEntities = (contentBlock: ContentBlock, callback: any, contentState: ContentState) => {
  contentBlock.findEntityRanges((character: any) => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
  }, callback);
};

const Link = React.forwardRef<HTMLElement>((props: any, ref) => {
  const { url, linkText, target } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <a
      href={url}
      style={toolbarStyleMap.link}
      target={target}
      rel='noopener noreferrer'
      data-key={props.entityKey}
    >
      <span onMouseDown={props.onClick}>{linkText || props.children}</span>
    </a>
  );
});
interface ILinkButton extends EditorProps {
  decorator?: DraftDecorator[];
  onPanelOpen?: () => void;
  onPanelClose?: () => void;
}
interface LinkPlugin extends EditorPlugin {
  LinkButton: React.FC<ILinkButton>;
}

// !! Use only inside react component in useMemo hook
export function createLinkPlugin(setReference: Function | null): LinkPlugin {
  const store: ILinkPluginStore = {
    getEditorState: undefined,
    setEditorState: undefined,
  };

  function linkClickHandler(e: UIEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget instanceof Element && !!setReference) {
      const linkNode = findLinkParentNode(e.currentTarget);
      setReference(linkNode);
    }
  }

  return {
    decorators: [
      {
        strategy: findLinkEntities,
        component: (props: any) => <Link {...props} />,
        props: {
          onClick: linkClickHandler,
        },
      },
    ],
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },
    LinkButton: LinkModule,
  };
}

function LinkModule({ editorState, setEditorState, decorator, onPanelOpen, onPanelClose }: ILinkButton) {
  const [visible, setVisible] = useState<boolean>(false);

  const handleShowToolPanel = (event: React.MouseEvent<HTMLDivElement>) => {
    track('document_edit_link_add', { path: 'floating' });
    event.preventDefault();
    event.stopPropagation();
    setVisible(true);
    onPanelOpen?.();
  };

  const handleLinkFormatting = (url: string): void => {
    const currentContent = editorState.getCurrentContent();
    currentContent.createEntity('LINK', 'MUTABLE', { url, target: '_blank' });

    const entityKey = currentContent.getLastCreatedEntityKey();
    const selection = editorState.getSelection();

    const newEditorState = EditorState.set(editorState, {
      currentContent: currentContent,
    });
    let newState = RichUtils.toggleLink(newEditorState, selection, entityKey);
    newState = EditorState.createWithContent(newState.getCurrentContent(), new CompositeDecorator(decorator ?? []));
    setEditorState(newState);
    setVisible(false);
    onPanelClose?.();
    localStorage.setItem('forceUpdate', 'true');
    clearFocus();
  };

  const handleClose = () => {
    setVisible(false);
    onPanelClose?.();
  };

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkPanel = target.closest('.link-panel-container');
      const linkButton = target.closest('.link-button-container');
      
      if (!linkPanel && !linkButton) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  return (
    <Tippy
      duration={0}
      content='Add link'
      className='!p-2 text-text5 !bg-text90 !opacity-100 !rounded !text-xs'
    >
      <div className='relative flex flex-col items-center justify-center link-button-container'>
        <div
          className='flex items-center justify-center h-7 w-8 cursor-pointer hover:bg-background'
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleShowToolPanel(event);
          }}
          data-tip='Add link'
          data-arrow-color='bg-none'
        >
          <LinkIcon
            className={cn({
              '[&>path]:stroke-primaryHover': editorState.getCurrentInlineStyle().has('link'),
            })}
          />
        </div>
        {visible && (
          <div className='flex justify-end absolute top-[36px] select-none link-panel-container'>
            <div className='mt-px bg-white rounded shadow-menu flex items-center w-fit gap-2'>
              <LinkPanel 
                onApply={handleLinkFormatting}
                autoFocus={false}
              />
            </div>
          </div>
        )}
      </div>
    </Tippy>
  );
}

export interface IEditLinkPanel extends ILinkButton {
  x?: number | null;
  y?: number | null;
  floating: (node: HTMLDivElement | null) => void;
  refs: {
    floating: React.MutableRefObject<HTMLElement | null>;
    reference: React.MutableRefObject<HTMLAnchorElement | null>;
  };
  onClose: Function;
}

export const LinkEditPanel = React.forwardRef(function (
  props: IEditLinkPanel,
  ref: ForwardedRef<HTMLDivElement | null>,
) {
  const { x, y, floating, refs, editorState, setEditorState, onClose } = props;
  const [linkDefaultValue, setLinkDefaultValue] = React.useState<string>('');
  const linkEditPanelStyles = !!y && !!x ? { top: y, left: x } : {};
  const currentReference = refs.reference.current;

  useLayoutEffect(() => {
    if (refs.reference.current) {
      setLinkDefaultValue((refs.reference.current as HTMLAnchorElement).href);
    }

    return () => {
      setLinkDefaultValue('');
      // onClose();
    };
  }, [currentReference]);

  const handleRemoveLink = (event?: React.UIEvent): void => {
    event?.preventDefault();
    if (!refs.reference.current) return;
    const entityKey = refs.reference.current.dataset.key as string;
    let selection = editorState.getSelection();

    const entityRange = getEntityRange(editorState, entityKey);

    if (!entityRange) {
      // TODO: Cleanup before deploy to production
      console.error('No entity key in current selection state');
      setLinkDefaultValue('');
      onClose();
      return;
    }

    const isBackward = selection.getIsBackward();

    if (isBackward) {
      selection = selection.merge({
        anchorOffset: entityRange.end,
        focusOffset: entityRange.start,
      });
    } else {
      selection = selection.merge({
        anchorOffset: entityRange.start,
        focusOffset: entityRange.end,
      });
    }

    if (!selection.isCollapsed()) {
      let newState = RichUtils.toggleLink(editorState, selection, null);
      setEditorState(EditorState.forceSelection(newState, newState.getSelection()));
    }
    setLinkDefaultValue('');
    onClose();
  };

  const handleEditLink = (url: string): void => {
    if (!refs.reference.current) return;
    const entityKey = refs.reference.current.dataset.key as string;
    const contentState = editorState.getCurrentContent();
    const newContentState = contentState.replaceEntityData(entityKey, { url });

    const newState = EditorState.push(editorState, newContentState, 'change-block-data');

    setEditorState(EditorState.forceSelection(newState, newState.getSelection()));
    setLinkDefaultValue('');
    onClose();
  };

  return (
    <div
      ref={floating}
      className='absolute flex justify-end'
      style={linkEditPanelStyles}
    >
      {linkDefaultValue ? (
        <div
          className='mt-px bg-white rounded shadow-menu flex items-center w-fit gap-2'
          ref={ref}
        >
          <EditLinkPanel
            value={linkDefaultValue}
            onEdit={handleEditLink}
            onDelete={handleRemoveLink}
          />
        </div>
      ) : null}
    </div>
  );
});

// Helpers

function findLinkParentNode(element: Element, limit = 4): Element | void {
  if (element.tagName === 'A') return element;
  if (element.parentElement) {
    return findLinkParentNode(element.parentElement, limit - 1);
  }
  console.error('noNode');
}
