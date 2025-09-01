import { ChangeEvent, DragEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useWorkspaceContext } from '@app/context/workspace/context';
import FileDropzoneActionsToolbar from '@features/file-dropzone-actions/ui/FileDropzoneActionsToolbar';
import { FileDropzoneAction } from '@features/file-dropzone-actions/ui/FileDropzoneActionsToolbar/props';
import { ReactComponent as VideoIcon } from '@shared/images/icons/video-play.svg';

import Tooltip from '@shared/uikit/tooltip';
import { errorToastOptions } from '@shared/common/Toast';

import { BlockProps } from './props';
import { useVideoUploaderEditorActions } from '../../api/useVideoUploaderEditorActions';
import { useFileUploadingApi } from '@widgets/editor/plugins/blocks/FileUploader/api/useFileUploadingApi';
import { validateVideoFile } from '../../api/video-validation-schema';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import VideoEmbedUploader from '../VideoEmbedUploader/VideoEmbedUploader';
import VideoUploadProgress from '../VideoUploadProgress/VideoUploadProgress';
import { Comment } from '@entities/models/Comment';

const VideoUploaderBlock = (props: BlockProps) => {
  const { activeWorkspace } = useWorkspaceContext();
  const [forceRender, setForceRender] = useState(0);
  
  const editorActions = useVideoUploaderEditorActions({
    editorState: props.blockProps.editorState,
    setEditorState: props.blockProps.setEditorState,
    block: props.block,
    contentState: props.contentState,
  });
  
  const readonly = props.readonly;
  // Get fresh entity data on every render to ensure we have latest video URL
  const entityData = editorActions.getVideoEntityData();

  const uploadFileApi = useFileUploadingApi({
    workspaceId: activeWorkspace?.id,
    onUploaded: editorActions.setVideoEntityData,
  });
  


  const handleUploadFile = (file: File) => {
    // Check if this is a video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file', errorToastOptions);
      return;
    }

    const validationResult = validateVideoFile(file.size, file.type);
    if (validationResult.success) {
      uploadFileApi.uploadFile(file);
    } else {
      validationResult.error?.issues.forEach((issue) => {
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

  const handleEmbedSubmit = (embedUrl: string, title?: string) => {
    console.log('[VideoBlock] Embedding video:', { embedUrl, title });
    editorActions.setEmbedData(embedUrl, title);
  };

  const handleComment = (comment: Comment) => {
    editorActions.insertComment(comment);
  };

  const handleDropzoneToolbarAction = (action: FileDropzoneAction) => {
    switch (action) {
      case 'delete': {
        // If block is empty (no video content), remove the entire block
        if (!fileName && !videoUrl) {
          editorActions.removeBlock();
        } else {
          // If block has content, just clear the data
          editorActions.removeEntityData();
          uploadFileApi.clearTmpData();
        }
        break;
      }
      default:
        throw new Error(`Unsupported dropzone action ${action}`);
    }
  };

  const fileName = entityData?.name ?? uploadFileApi.tmpFileData?.name;
  const extension = entityData?.extension ?? uploadFileApi.tmpFileData?.extension ?? 'unknown';
  const videoUrl = entityData?.url;



  // Force re-render when upload state changes to ensure UI updates
  useEffect(() => {
    if (!uploadFileApi.isPending && fileName && !videoUrl) {
      // Upload completed but video URL not showing - force refresh
      const timer = setTimeout(() => {
        setForceRender(prev => prev + 1);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [uploadFileApi.isPending, fileName, videoUrl]);



  return (
    <div
      className='w-full'
      contentEditable={false}
      onPaste={(e) => {
        // Prevent global paste handler from interfering with video block paste events
        console.log('🎯 VideoUploaderBlock paste event - stopping propagation');
        e.stopPropagation();
      }}
    >
      {fileName ? (
        <Tooltip
          variant='light'
          delay={[0, 300]}
          disabled={uploadFileApi.isPending}
          interactive
          content={
            <FileDropzoneActionsToolbar
              onComment={handleComment}
              onAction={handleDropzoneToolbarAction}
            />
          }
        >
          <div className='relative'>
            {/* Video Preview or File Preview */}
            {videoUrl && !uploadFileApi.isPending ? (
              <div className='relative'>
                {entityData?.embedUrl ? (
                  // Embed video (YouTube, etc.)
                  <div 
                    className='aspect-video bg-gray-100 rounded-lg flex items-center justify-center'
                    style={{
                      width: '100%',
                      minWidth: '280px',
                      maxWidth: 'var(--text-editor-row-width)',
                    }}
                  >
                    <iframe
                      src={entityData.embedUrl}
                      title={fileName}
                      width='100%'
                      height='100%'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                      className='rounded-lg'
                    />
                  </div>
                ) : (
                  // Direct video file
                  <VideoPlayer
                    src={videoUrl}
                    title={fileName}
                    width='100%'
                    height='auto'
                    className='aspect-video'
                    style={{
                      minWidth: '280px',
                      maxWidth: 'var(--text-editor-row-width)',
                    }}
                    onError={() => {
                      toast.error('Failed to load video', errorToastOptions);
                    }}
                  />
                )}
                
                {/* Video description */}
                {entityData?.title && (
                  <div className="mt-3 text-sm text-gray-600 text-center px-4">
                    {entityData.title}
                  </div>
                )}
              </div>
            ) : (
              // Video upload progress
              <VideoUploadProgress
                fileName={fileName || 'Uploading video...'}
                progress={uploadFileApi.progress.progress || 0}
                onCancel={() => {
                  editorActions.removeEntityData();
                  uploadFileApi.clearTmpData();
                }}
              />
            )}
          </div>
        </Tooltip>
      ) : (
        <Tooltip
          variant='light'
          delay={[0, 300]}
          interactive
          content={
            <FileDropzoneActionsToolbar
              onComment={handleComment}
              onAction={handleDropzoneToolbarAction}
            />
          }
        >
          <VideoEmbedUploader
            onFileUpload={handleChangeFile}
            onFileDrop={handleDropFile}
            onEmbedSubmit={handleEmbedSubmit}
            blockKey={props.block.getKey()}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default VideoUploaderBlock;
