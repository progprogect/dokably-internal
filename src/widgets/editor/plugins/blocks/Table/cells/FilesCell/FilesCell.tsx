import React, { ChangeEvent, DragEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import classNames from 'classnames';
import { PlusIcon, XIcon } from 'lucide-react';

import { useWorkspaceContext } from '@app/context/workspace/context';
import DroppableFileUploader from '@shared/uikit/droppable-file-uploader';
import { errorToastOptions } from '@shared/common/Toast';
import { useTableContext } from '@widgets/editor/plugins/blocks/Table/TableContext';

import { ActionTypes } from '../../utils';
import { useFileUploadingApi } from '../../../FileUploader/api/useFileUploadingApi';
import { validateFileSzie } from '../../../FileUploader/api/file-validation-schema';

import styles from '../DocLinkCell/style.module.scss';

interface Props {
  value: any[];
  columnId: string;
  rowIndex: number;
}

export const FilesCell = ({ value, columnId, rowIndex }: Props) => {
  const [cellValue, setCellValue] = useState({ files: value, update: false });
  const { dataDispatch } = useTableContext();
  const { activeWorkspace } = useWorkspaceContext();

  const uploadFileApi = useFileUploadingApi({
    workspaceId: activeWorkspace?.id,
    onUploaded: (uploadedData) =>
      setCellValue((value) => ({
        files: [...(value?.files || []), uploadedData],
        update: true,
      })),
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

  const onDeleteClick = (fileId: string) => {
    setCellValue((value) => ({
      files: value.files.filter((item) => item?.id !== fileId),
      update: true,
    }));
  };

  useEffect(() => {
    setCellValue({ files: value, update: false });
  }, [value]);

  useEffect(() => {
    if (cellValue.update) {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId,
        rowIndex,
        value: cellValue.files,
      });
    }
  }, [cellValue.update, columnId, rowIndex]);

  return (
    <div
      className={classNames(styles.attachedLinksCell, styles.filesCell, {
        [styles.filesCellEmpty]: !cellValue.files?.length,
      })}
    >
      <div className={styles.attachedLinksCellLabel}>
        {cellValue.files?.length
          ? cellValue.files.map((file) => (
              <span
                className={styles.valueElement}
                key={file?.id}
              >
                <a
                  href={file?.url}
                  target='_blank'
                  className='cursor-pointer hover:text-fontBlue transition block'
                >
                  {file?.name}
                </a>
                <XIcon onClick={() => onDeleteClick(file?.id)} />
              </span>
            ))
          : null}
        <DroppableFileUploader
          onChange={handleChangeFile}
          onDrop={handleDropFile}
        >
          {cellValue.files?.length && cellValue.files?.length < 3 ? (
            <span className={styles.addLinkButton}>
              <PlusIcon />
              Add file
            </span>
          ) : null}
        </DroppableFileUploader>
      </div>
    </div>
  );
};
