import { ChangeEvent, DragEvent, FC } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';
import { ExternalLink, PlusIcon, TrashIcon } from 'lucide-react';
import { last } from 'lodash';

import { useWorkspaceContext } from '@app/context/workspace/context';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { validateFileSzie } from '@widgets/editor/plugins/blocks/FileUploader/api/file-validation-schema';
import {
  UploaderFileData,
  useFileUploadingApi,
} from '@widgets/editor/plugins/blocks/FileUploader/api/useFileUploadingApi';
import { errorToastOptions } from '@shared/common/Toast';
import DroppableFileUploader from '@shared/uikit/droppable-file-uploader';

import styles from './styles.module.scss';

export interface TaskFilesPropertyProps {
  task: ITask;
  property: IProperty;
  size?: 'sm' | 'lg';
  refetch?: () => void;
}

const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];

export const TaskFilesProperty: FC<TaskFilesPropertyProps> = ({ task, property, refetch }) => {
  // const { setReadOnly } = useDokablyEditor();
  const { activeWorkspace } = useWorkspaceContext();
  const { updateTaskFiles } = useTaskBoard();
  const fileIds = property?.files?.map((file) => file.id) || [];

  const uploadFileApi = useFileUploadingApi({
    workspaceId: activeWorkspace?.id,
    onUploaded: async (uploadedData: UploaderFileData) => {
      await updateTaskFiles(task.id, property.id, [...fileIds, uploadedData.id]);
      refetch?.();
    },
  });

  const isImage = (name: string) => {
    const format = name.split('.')[name.split('.').length - 1];
    const isImage = imageExtensions.indexOf(format) > -1;
    return isImage;
  };

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

  const onDeleteClick = async (id: string) => {
    await updateTaskFiles(
      task.id,
      property.id,
      fileIds.filter((fileId) => fileId !== id),
    );
    refetch?.();
  };

  return (
    <div className={styles.filesWrapper}>
      {property?.files?.length
        ? property?.files.map((file) => (
            <div
              key={file.id}
              className={styles.valueElement}
            >
              <span className={styles.file}>
                {isImage(file?.name) ? <img src={file?.url} /> : last(file?.name.split('.'))}
                <span>
                  <a
                    href={file?.url}
                    target='_blank'
                  >
                    <ExternalLink />
                  </a>
                  <TrashIcon onClick={() => onDeleteClick(file?.id)} />
                </span>
              </span>
            </div>
          ))
        : null}
      {uploadFileApi.isPending && (
        <div className='flex items-center'>
          {
            <LoaderIcon
              style={{ width: 20, height: 20 }}
              className='animate-spin'
            />
          }
        </div>
      )}
      <DroppableFileUploader
        className={styles.addFileButton}
        onChange={handleChangeFile}
        onDrop={handleDropFile}
      >
        <PlusIcon />
        {property?.files?.length ? null : 'Add file'}
      </DroppableFileUploader>
    </div>
  );
};
