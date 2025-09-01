import React, { ImgHTMLAttributes, ReactElement, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ContentBlock, ContentState, EditorState } from 'draft-js';
import cn from 'classnames';
import omit from 'lodash/omit';
import { useLocalStorage } from 'usehooks-ts';
import { track } from '@amplitude/analytics-browser';

import { AuthResponse } from '@app/redux/api/authApi';
import { uploadImage } from '@app/services/imageUpload.service';
import { useClickOutside } from '@app/hooks/useClickOutside';
import ContextMenu from '@widgets/editor/plugins/ContextMenu/ContextMenu';
import { useWorkspaceContext } from '@app/context/workspace/context';

import { ReactComponent as ImageIcon } from '@images/image_icon.svg';
import { IImagePluginStore, ImagePluginTheme } from '.';
import { IUploadedFileData, UploadWidgetConfig } from './types';
import ImageDNDWrapper from './ImageDNDWrapper';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  block: ContentBlock;
  className?: string;
  theme?: ImagePluginTheme;
  contentState: ContentState;
  blockProps: {
    getEditorState: () => EditorState;
    setEditorState: (data: EditorState) => void;
    store: IImagePluginStore;
  };

  //removed props
  blockStyleFn: unknown;
  customStyleMap: unknown;
  customStyleFn: unknown;
  decorator: unknown;
  forceSelection: unknown;
  offsetKey: unknown;
  selection: unknown;
  tree: unknown;
  preventScroll: unknown;
}

export interface IImageUploadResult {
  src: string;
  id?: string;
  alt?: string;
  caption?: string;
  entityId?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(props, ref): ReactElement {
  const { block, className, theme = {}, ...otherProps } = props;
  const { getEditorState, setEditorState } = props.blockProps;
  const { ref: popupRef, isVisible, setIsVisible } = useClickOutside(false);
  const { contentState, ...elementProps } = omit(otherProps, [
    'blockProps',
    'customStyleMap',
    'customStyleFn',
    'decorator',
    'forceSelection',
    'offsetKey',
    'selection',
    'tree',
    'blockStyleFn',
    'preventScroll',
  ]);
  const combinedClassName = cn(theme.image, className);
  const { src, altText, caption, imageId } = contentState.getEntity(block.getEntityAt(0)).getData();

  const handleChange = (data: IImageUploadResult) => {
    const entityKey = props.contentState.getLastCreatedEntityKey();
    const newContentState = props.contentState.replaceEntityData(entityKey, {
      src: data.src,
      imageId: data.id,
    });

    let newState = EditorState.push(getEditorState(), newContentState, 'change-block-data');

    setEditorState(EditorState.forceSelection(newState, newState.getSelection()));
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsVisible(true);
  };

  if (!src) {
    return (
      <ImageDNDWrapper
        block={block}
        setEditorState={setEditorState}
        getEditorState={() => getEditorState()}
      >
        <div className='dokably-image-block__upload'>
          <ContextMenu
            block={props.block}
            store={props.blockProps.store}
          />
          <ImageUploadBlock onUpload={handleChange} />
        </div>
      </ImageDNDWrapper>
    );
  }
  return (
    <ImageDNDWrapper
      block={block}
      setEditorState={setEditorState}
      getEditorState={() => getEditorState()}
    >
      <figure
        className='flex justify-center relative items-start w-full dokably-image-block'
        ref={popupRef}
        onContextMenu={handleContextMenu}
      >
        <ContextMenu
          block={props.block}
          store={props.blockProps.store}
        />
        <img
          {...elementProps}
          ref={ref}
          src={src}
          role='presentation'
          className={combinedClassName}
          alt={altText || ''}
          data-imageid={imageId}
        />
        {!!caption && <figcaption>{caption}</figcaption>}
      </figure>
    </ImageDNDWrapper>
  );
});

const DEFAULT_OPTIONS = {
  maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
  mimeTypes: [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/webp',
    'image/avif',
  ],
  multi: false,
  layout: 'inline' as const,
};

interface IImageUploadProps {
  width?: string;
  height?: string;
  options?: UploadWidgetConfig;
  onUpload: (data: IImageUploadResult) => void;
}

export interface Rect {
  height: number;
  width: number;
}

export interface RectWithPos extends Rect {
  x: number;
  y: number;
}

export function ImageUploadBlock({
  width,
  height,
  onUpload,
  options = DEFAULT_OPTIONS,
}: IImageUploadProps): JSX.Element {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minWidth: '280px',
        maxWidth: width ?? 'var(--text-editor-row-width)',
        height: height ?? '180px',
      }}
    >
      <UploadWidget
        options={options}
        onUpload={onUpload}
      />
    </div>
  );
}

interface IUploadWidget {
  options?: UploadWidgetConfig;
  onUpload: (data: IImageUploadResult) => void;
}

export const UploadWidget = ({ options, onUpload }: IUploadWidget): JSX.Element => {
  const { activeWorkspace } = useWorkspaceContext();
  const [token] = useLocalStorage('tokens', {} as AuthResponse);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (errorMessage) setErrorMessage(null);
  }, []);

  const doUpload = async (file: File): Promise<IUploadedFileData> => {
    setLoading(true);
    return uploadImage(file, activeWorkspace?.id, options);
  };

  const addFiles = (files: File[]): void => {
    files.slice(0, 1).forEach((file) => {
      doUpload(file)
        .then(
          (uploadedFileData) => {
            onUpload({ src: uploadedFileData.presignedObjectUrl });
          },
          (error) => {
            track('document_edit_insert_failed', {
              reason: error?.message ?? 'Upload error. Try other file.',
            });
            setErrorMessage(error?.message ?? 'Upload error. Try other file.');
          },
        )
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const { isDragging, ...rootProps } = useDragDrop(addFiles);

  return (
    <WidgetBase
      htmlProps={rootProps}
      isDraggable={true}
      isDragging={isDragging}
    >
      <div
        className={cn('text-center', {
          'skeleton cursor-progress': isLoading,
        })}
      >
        <UploaderWelcomeScreen
          addFiles={addFiles}
          options={options}
          isLoading={isLoading}
        />
        {!!errorMessage && <span className='select-none'>{errorMessage}</span>}
      </div>
    </WidgetBase>
  );
};

interface IUploaderWelcomeScreen {
  addFiles: (files: File[]) => void;
  options?: UploadWidgetConfig;
  isLoading?: boolean;
}

function UploaderWelcomeScreen({ addFiles, options, isLoading }: IUploaderWelcomeScreen): JSX.Element {
  return (
    <div
      className={cn('flex flex-col items-center select-none', {
        'cursor-pointer': !isLoading,
        'cursor-progress': isLoading,
      })}
    >
      <UploadButton
        multi={!!options?.multi}
        text={isLoading ? 'Drag & drop or click to upload an image' : 'Loading'}
        className={cn('btn--primary btn--upload ', {
          'cursor-pointer': !isLoading,
          'cursor-progress': isLoading,
        })}
        onUpload={addFiles}
      >
        <div className='text-secondary mb-1 mt-2 text-center select-none flex flex-col'>
          <span className='text-sm4l'>Drag & drop or click to upload an image</span>
          <span className='text-text50 text-sm4l'>The maximum size per file is 50 MB</span>
        </div>
      </UploadButton>
    </div>
  );
}

interface FileInputChangeEvent {
  target: HTMLInputElement;
}

function UploadButton({
  className,
  onUpload,
  text,
  children,
}: {
  className?: string;
  multi: boolean;
  onUpload: (files: File[]) => void;
  text: string;
  children: React.ReactNode;
}): JSX.Element {
  const [fileInputKey] = useState(Math.random());
  const [inputId] = useState(`uploader__input-${Math.round(Math.random() * 1000000)}`);

  return (
    <label
      className={cn('btn btn--file flex flex-col items-center', className)}
      htmlFor={inputId}
    >
      {/* <ImageIcon width={24} height={24} title={text} /> */}
      <ImageIcon
        width={24}
        height={24}
      />

      <input
        key={fileInputKey}
        id={inputId}
        name={inputId}
        type='file'
        className='absolute top-0 left-0 w-full h-full opacity-0 -z-10'
        onChange={
          ((e: FileInputChangeEvent): void => {
            const input = e.target;
            const files = Array.from(input.files ?? []);
            if (files.length > 0) {
              onUpload(files);
            }
          }) as any
        }
      />
      {children}
    </label>
  );
}

interface IWidgetBase {
  children: JSX.Element | JSX.Element[] | string | number | boolean;
  htmlProps?: any;
  isDraggable?: boolean;
  isDragging?: boolean;
}

function WidgetBase({ children, htmlProps, isDraggable, isDragging }: IWidgetBase): JSX.Element {
  // Use for breakpoints definition https://github.com/upload-io/uploader/blob/main/lib/src/components/widgets/widgetBase/WidgetBase.tsx#L20
  const [dimensions, containerRef] = getElementDimensionsOnResize();

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute top-0 right-0 left-0 bottom-0 justify-center items-center flex-col flex inset-4 rounded-md',
        {
          'border border-text20 border-dashed': !!isDraggable,
          'border border-primary border-dashed': !!isDragging,
        },
      )}
      {...htmlProps}
    >
      <div className='justify-center items-center flex-col flex absolute bottom-0 top-0 left-0 right-0 z-10'>
        {children}
      </div>
    </div>
  );
}

function useElementRef(): [HTMLElement | undefined, (e: HTMLElement | null) => void] {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined);
  const elementRef = useCallback((e: HTMLElement | null) => {
    setElement(e ?? undefined);
  }, []);

  return [element, elementRef];
}

export function getElementDimensionsOnResize(): [RectWithPos | undefined, (element: HTMLElement | null) => void] {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [element, elementRef] = useElementRef();
  const dimensions = doGetElementDimensionsOnResize(element, element);
  return [dimensions, elementRef];
}

function doGetElementDimensionsOnResize(
  element: HTMLElement | undefined,
  parentElement: HTMLElement | undefined,
): RectWithPos | undefined {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [dimensions, setDimensions] = useState<RectWithPos | undefined>(getDimensionsFromElement(element));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    const updateDimensions = (): void => setDimensions(getDimensionsFromElement(element));
    if (element === undefined || parentElement === undefined) {
      return;
    }
    element.onload = updateDimensions;
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(parentElement);
    return () => observer.disconnect();
  }, [element]);

  return dimensions;
}

function getDimensionsFromElement(element: HTMLElement | undefined): RectWithPos | undefined {
  if (element === undefined) {
    return undefined;
  }
  const domRect = element.getBoundingClientRect();
  return {
    width: domRect.width,
    height: domRect.height,
    x: element.offsetLeft,
    y: element.offsetTop,
  };
}

function useDragDrop(acceptFiles: (files: File[]) => void): {
  isDragging: boolean | undefined;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
} {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget !== null && (e?.currentTarget as any)?.contains(e.relatedTarget) === true) {
      return;
    }
    setIsDragging(false);
  };
  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer !== null) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };
  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer !== null) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        acceptFiles(files);
        e.dataTransfer.clearData();
      }
    }
  };
  return {
    isDragging,
    onDrop: (e: DragEvent) => handleDrop(e),
    onDragOver: (e: DragEvent) => handleDragOver(e),
    onDragEnter: (e: DragEvent) => handleDragEnter(e),
    onDragLeave: (e: DragEvent) => handleDragLeave(e),
  };
}
