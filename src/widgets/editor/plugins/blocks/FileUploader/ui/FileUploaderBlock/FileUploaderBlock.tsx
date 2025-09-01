import { ChangeEvent, DragEvent } from 'react';
import toast from 'react-hot-toast';

import { useWorkspaceContext } from '@app/context/workspace/context';
import FileActionsToolbar from '@features/file-actions/ui/FileActionsToolbar';
import { FileAction } from '@features/file-actions/ui/FileActionsToolbar/props';
import FileDropzoneActionsToolbar from '@features/file-dropzone-actions/ui/FileDropzoneActionsToolbar';
import { FileDropzoneAction } from '@features/file-dropzone-actions/ui/FileDropzoneActionsToolbar/props';
import { ReactComponent as AttachIcon } from '@shared/images/icons/attach.svg';
import DroppableFileUploader from '@shared/uikit/droppable-file-uploader';
import FilePreview from '@shared/uikit/file-preview';
import Tooltip from '@shared/uikit/tooltip';
import { errorToastOptions } from '@shared/common/Toast';

import { BlockProps } from './props';
import { useFileUploaderEditorActions } from '../../api/useFileUploaderEditorActions';
import { useFileUploadingApi } from '../../api/useFileUploadingApi';
import { validateFileSzie } from '../../api/file-validation-schema';

const FileUploaderBlock = (props: BlockProps) => {
  const { activeWorkspace } = useWorkspaceContext();
  const editorActions = useFileUploaderEditorActions({
    editorState: props.blockProps.editorState,
    setEditorState: props.blockProps.setEditorState,
    block: props.block,
    contentState: props.contentState,
  });
  const readonly = props.readonly;

  const entityData = editorActions.getEntityData();

  const uploadFileApi = useFileUploadingApi({
    workspaceId: activeWorkspace?.id,
    onUploaded: editorActions.setFileEntityData,
  });

  const handleUploadFile = (file: File) => {
    const validationResult = validateFileSzie(file.size);
    if (validationResult.success) {
      uploadFileApi.uploadFile(file);
    } else {
      validationResult.error.issues.forEach((issue) => {
        toast.error(issue.message, errorToastOptions);
      });
    }
  };

  const handleDropFile = (event: DragEvent<HTMLElement>) => {
    const firstFile = event.dataTransfer.files[0];
    handleUploadFile(firstFile);
  };

  const handleChangeFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const firstFile = event.target.files?.[0];
    if (!firstFile) return;
    handleUploadFile(firstFile);
    event.currentTarget.value = '';
  };

  const handleFilePreviewToolbarAction = async (action: FileAction) => {
    switch (action) {
      case 'delete': {
        editorActions.removeEntityData();
        uploadFileApi.clearTmpData();
        break;
      }
      case 'expand': {
        // TODO: Implement `expand` feature on demand
        break;
      }
      default:
        throw new Error(`Unsupported file preview action ${action}`);
    }
  };

  const handleDropzoneToolbarAction = (action: FileDropzoneAction) => {
    switch (action) {
      case 'delete': {
        editorActions.removeEntityData();
        editorActions.removeBlock();
        break;
      }
      default:
        throw new Error(`Unsupported dropzone action ${action}`);
    }
  };

  const fileName = entityData?.name ?? uploadFileApi.tmpFileData?.name;
  const extension = entityData?.extension ?? uploadFileApi.tmpFileData?.extension ?? 'unknown';

  return (
    <div
      className='w-full'
      contentEditable={false}
    >
      {fileName ? (
        <Tooltip
          variant='light'
          delay={[0, 300]}
          disabled={uploadFileApi.isPending}
          interactive
          content={
            <FileActionsToolbar
              readonly={readonly}
              onComment={editorActions.insertComment}
              fileIsNotAvailable={uploadFileApi.isError}
              fileUrl={entityData?.url}
              onAction={handleFilePreviewToolbarAction}
            />
          }
        >
          <FilePreview
            disabled={uploadFileApi.isError || uploadFileApi.isPending}
            progress={uploadFileApi.progress.progress}
            filtType={extension}
            showProgress={uploadFileApi.isPending}
            onRetry={uploadFileApi.retryUploadFile}
            error={uploadFileApi.error}
            fileName={fileName}
          >
            <a
              href={entityData?.url}
              target='_blank'
              className='cursor-pointer hover:text-fontBlue transition block'
            >
              {fileName}
            </a>
          </FilePreview>
        </Tooltip>
      ) : (
        <Tooltip
          variant='light'
          delay={[0, 300]}
          interactive
          content={
            <FileDropzoneActionsToolbar
              onComment={editorActions.insertComment}
              onAction={handleDropzoneToolbarAction}
            />
          }
        >
          <DroppableFileUploader
            onChange={handleChangeFile}
            onDrop={handleDropFile}
          >
            <div className='flex flex-col items-center gap-2'>
              <AttachIcon className='text-2xl' />
              Drag & drop or click to upload file
            </div>
          </DroppableFileUploader>
        </Tooltip>
      )}
    </div>
  );
};

export default FileUploaderBlock;
