import { ChangeEvent, DragEvent, useEffect, useState } from 'react';
import toast, { LoaderIcon } from 'react-hot-toast';
import { CellContext } from '@tanstack/react-table';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { last } from 'lodash';
import classNames from 'classnames';

import { useWorkspaceContext } from '@app/context/workspace/context';
import { IProperty, ITask } from '@widgets/task-board/types';
import { useTaskBoard } from '@widgets/task-board/task-board-context';
import { validateFileSzie } from '@widgets/editor/plugins/blocks/FileUploader/api/file-validation-schema';
import {
  UploaderFileData,
  useFileUploadingApi,
} from '@widgets/editor/plugins/blocks/FileUploader/api/useFileUploadingApi';
import docLinkStyles from '@widgets/editor/plugins/blocks/Table/cells/DocLinkCell/style.module.scss';
import ExternalLink from '@widgets/editor/plugins/blocks/Table/img/ExternalLink';
import { useClickOutside } from '@app/hooks/useClickOutside';
import DroppableFileUploader from '@shared/uikit/droppable-file-uploader';
import { errorToastOptions } from '@shared/common/Toast';

import BodyCellContent from '../../base-cells/BodyCellContent';
import { getColumnMeta } from '../../../utils/getColumnMeta';

import styles from './styles.module.scss';

const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];

function FilesBodyCell(context: CellContext<ITask, IProperty | undefined>) {
  // const isVirtual = isVirtualTask(context.cell.row.original);
  const { activeWorkspace } = useWorkspaceContext();
  const { ref, isVisible, setIsVisible } = useClickOutside(false, undefined, 'mouseup');
  const initialValue = context.getValue();
  const [value, setValue] = useState<IProperty | undefined>(initialValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileIds = value?.files?.map((file) => file.id) || [];
  const { updateTaskFiles } = useTaskBoard();

  useEffect(() => setValue(initialValue), [initialValue]);

  const uploadFileApi = useFileUploadingApi({
    workspaceId: activeWorkspace?.id,
    onUploaded: (uploadedData: UploaderFileData) => {
      updateTaskFiles(context.row.original.id, context.column.id, [...fileIds, uploadedData.id]);
      // setValue({
      //   id: uploadedData?.id,
      //   name: initialValue?.name || "Files and media",
      //   type: initialValue?.type || "file",
      //   fileName: uploadedData.name,
      //   fileLink: uploadedData.url,
      // });
      setValue((value: any) => ({
        ...value,
        files: value?.files.length
          ? [
              ...value?.files,
              {
                id: uploadedData?.id,
                name: uploadedData.name,
                url: uploadedData.url,
              },
            ]
          : [],
      }));
      setIsLoading(false);
    },
  });
  const columnMeta = getColumnMeta(context.column);

  const isImage = (name: string) => {
    const format = name.split('.')[name.split('.').length - 1];
    const isImage = imageExtensions.indexOf(format) > -1;
    return isImage;
  };

  const handleUploadFile = (file: File) => {
    const validationResult = validateFileSzie(file.size);
    if (validationResult.success) {
      setIsLoading(true);
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

  const onDeleteClick = (id: string) => {
    updateTaskFiles(
      context.row.original.id,
      context.column.id,
      fileIds.filter((fileId) => fileId !== id),
    );
    setValue((value: any) => ({
      ...value,
      files: value?.files.filter((file: any) => file.id !== id),
    }));
  };

  return (
    <BodyCellContent
      className={classNames(
        columnMeta.className,
        styles.attachedLinksCell,
        docLinkStyles.filesCell,
        styles.tableCellFiles,
      )}
    >
      <div
        ref={ref}
        onClick={() => setIsVisible(true)}
        className={styles.filesWrapper}
        style={{
          borderColor: isVisible ? '#4a86ff' : '',
          height: value?.files?.length || isLoading ? 'auto' : '100%',
        }}
      >
        {value?.files?.length
          ? value?.files.map((file) => (
              <div
                key={file.id}
                className={classNames(docLinkStyles.valueElement, styles.valueElement)}
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
        {isLoading && (
          <LoaderIcon
            style={{ width: 20, height: 20 }}
            className='animate-spin'
          />
        )}
        {isVisible && (
          <DroppableFileUploader
            className={styles.addLinkButton}
            onChange={handleChangeFile}
            onDrop={handleDropFile}
          >
            <PlusIcon />
            Add file
          </DroppableFileUploader>
        )}
      </div>
    </BodyCellContent>
  );
}

export default FilesBodyCell;
